import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import DOMPurify from "isomorphic-dompurify";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SVG_MAX_SIZE = 256 * 1024;
const STORED_FILENAME = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|gif|webp|avif|svg)$/i;

const MIME_CONFIG = {
  "image/jpeg": { extension: ".jpg", signatures: [[0xff, 0xd8, 0xff]] },
  "image/png": { extension: ".png", signatures: [[0x89, 0x50, 0x4e, 0x47]] },
  "image/gif": { extension: ".gif", signatures: [[0x47, 0x49, 0x46, 0x38]] },
  "image/webp": { extension: ".webp", signatures: [[0x52, 0x49, 0x46, 0x46]] },
  "image/avif": { extension: ".avif", signatures: [[0x00, 0x00, 0x00], [0x66, 0x74, 0x79, 0x70]] },
  "image/svg+xml": { extension: ".svg", signatures: [] },
} as const;

export class UploadError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

function startsWith(buffer: Buffer, signature: readonly number[], offset = 0): boolean {
  return signature.every((byte, index) => buffer[offset + index] === byte);
}

function hasValidSignature(mime: keyof typeof MIME_CONFIG, buffer: Buffer): boolean {
  if (mime === "image/webp") {
    return startsWith(buffer, MIME_CONFIG[mime].signatures[0]) &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }
  if (mime === "image/avif") {
    return buffer.subarray(4, 8).toString("ascii") === "ftyp" &&
      buffer.subarray(8, Math.min(buffer.length, 32)).includes(Buffer.from("avif"));
  }
  return MIME_CONFIG[mime].signatures.some((signature) => startsWith(buffer, signature));
}

export async function storeImageUpload(
  file: File,
  subDirectory: "blog" | "services",
): Promise<{ filename: string; url: string }> {
  if (!(file.type in MIME_CONFIG)) {
    throw new UploadError("unsupported_type", "Unsupported image type");
  }
  if (file.size === 0) {
    throw new UploadError("empty_file", "The uploaded file is empty");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError("file_too_large", "The uploaded file exceeds 10 MB");
  }

  const mime = file.type as keyof typeof MIME_CONFIG;
  let buffer = Buffer.from(await file.arrayBuffer());

  if (mime === "image/svg+xml") {
    if (buffer.length > SVG_MAX_SIZE) {
      throw new UploadError("file_too_large", "SVG files cannot exceed 256 KB");
    }
    const sanitized = DOMPurify.sanitize(buffer.toString("utf8"), {
      USE_PROFILES: { svg: true, svgFilters: true },
      FORBID_TAGS: ["foreignObject", "script"],
      FORBID_ATTR: ["onload", "onerror"],
    });
    if (!sanitized.trim()) {
      throw new UploadError("invalid_content", "The SVG contains no safe content");
    }
    buffer = Buffer.from(sanitized, "utf8");
  } else if (!hasValidSignature(mime, buffer)) {
    throw new UploadError("invalid_content", "The file content does not match its image type");
  }

  const filename = `${randomUUID()}${MIME_CONFIG[mime].extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads", subDirectory);
  await mkdir(uploadDirectory, { recursive: true, mode: 0o755 });
  await writeFile(path.join(uploadDirectory, filename), buffer, { mode: 0o644 });

  return {
    filename,
    url: `/uploads/${subDirectory}/${filename}`,
  };
}

export async function deleteStoredUpload(
  url: string,
  subDirectory: "blog" | "services",
): Promise<boolean> {
  const prefix = `/uploads/${subDirectory}/`;
  if (!url.startsWith(prefix)) return false;

  const filename = url.slice(prefix.length);
  if (!STORED_FILENAME.test(filename)) return false;

  const uploadDirectory = path.resolve(process.cwd(), "public", "uploads", subDirectory);
  const filePath = path.resolve(uploadDirectory, filename);
  if (path.dirname(filePath) !== uploadDirectory) return false;

  try {
    await unlink(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}
