export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminUser } from "@lib/admin/permissions";
import { getDrizzle } from "@database/drizzle";
import { blogMedia, auditLog } from "@database/schemas";
import { eq, desc, count, ilike } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const guardAdmin = (locals: App.Locals) => {
  if (!isAdminUser(locals.user)) {
    return json(403, { error: "forbidden" });
  }
  return null;
};

const generateId = () => crypto.randomUUID();

const UPLOAD_DIR = "public/uploads/blog";
const UPLOAD_URL_PREFIX = "/uploads/blog";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * GET /api/admin/blog/media
 * List media with optional type filter
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const db = await getDrizzle();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("perPage") ?? "30")));
  const typeFilter = url.searchParams.get("type")?.trim() ?? "";
  const search = url.searchParams.get("q")?.trim() ?? "";

  const conditions: ReturnType<typeof eq>[] = [];
  if (typeFilter) conditions.push(eq(blogMedia.type, typeFilter));
  if (search) conditions.push(ilike(blogMedia.url, `%${search}%`));

  const whereClause = conditions.length > 0
    ? conditions.reduce((a, b) => a && b ? a : a || b)
    : undefined;

  const [totalResult] = whereClause
    ? await db.select({ value: count() }).from(blogMedia).where(whereClause)
    : await db.select({ value: count() }).from(blogMedia);

  const total = totalResult.value;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const media = whereClause
    ? await db.select().from(blogMedia).where(whereClause).orderBy(desc(blogMedia.createdAt)).limit(perPage).offset((page - 1) * perPage)
    : await db.select().from(blogMedia).orderBy(desc(blogMedia.createdAt)).limit(perPage).offset((page - 1) * perPage);

  return json(200, { media, total, page, perPage, totalPages });
};

/**
 * POST /api/admin/blog/media
 * Upload a file (multipart/form-data) or register a URL-only media
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const db = await getDrizzle();
  const userId = locals.user?.id ?? "system";
  const contentType = request.headers.get("content-type") ?? "";

  // JSON action (delete, update metadata)
  if (contentType.includes("application/json")) {
    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      return json(400, { error: "invalid_body" });
    }

    const action = String(payload.action ?? "").trim();

    if (action === "delete") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      const [existing] = await db.select().from(blogMedia).where(eq(blogMedia.id, id));
      if (existing) {
        // Try to delete file on disk
        try {
          const filePath = path.join(process.cwd(), "public", existing.url);
          await fs.unlink(filePath);
        } catch { /* file may not exist */ }

        await db.delete(blogMedia).where(eq(blogMedia.id, id));

        await db.insert(auditLog).values({
          id: generateId(),
          action: "blog.media.delete",
          userId,
          targetId: id,
          createdAt: new Date(),
        });
      }
      return json(200, { ok: true });
    }

    if (action === "update") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (payload.caption !== undefined) updateData.caption = payload.caption;
      if (payload.description !== undefined) updateData.description = payload.description;
      if (payload.alt !== undefined) updateData.alt = payload.alt;

      await db.update(blogMedia).set(updateData).where(eq(blogMedia.id, id));
      return json(200, { ok: true, id });
    }

    return json(400, { error: "unknown_action" });
  }

  // File upload (multipart)
  if (!contentType.includes("multipart/form-data")) {
    return json(400, { error: "expected_multipart" });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return json(400, { error: "no_file" });
    }

    if (file.size > MAX_FILE_SIZE) {
      return json(400, { error: "file_too_large", max: MAX_FILE_SIZE });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return json(400, { error: "unsupported_type", allowed: ALLOWED_TYPES });
    }

    const id = generateId();
    const ext = file.name.split(".").pop() ?? "bin";

    // Accept optional custom filename from the client
    const customName = (formData.get("customName") as string | null)?.trim();
    let baseName: string;
    if (customName) {
      // Sanitize: keep only safe URL chars, collapse multiple dashes
      baseName = customName
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || id;
    } else {
      baseName = id;
    }

    // Ensure uniqueness: check if file exists and append suffix if needed
    let filename = `${baseName}.${ext}`;
    const uploadPath = path.join(process.cwd(), UPLOAD_DIR);
    await fs.mkdir(uploadPath, { recursive: true });
    let counter = 1;
    while (true) {
      try {
        await fs.access(path.join(uploadPath, filename));
        // File exists, try next suffix
        filename = `${baseName}-${counter}.${ext}`;
        counter++;
      } catch {
        break; // File doesn't exist, we can use this name
      }
    }

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadPath, filename), buffer);

    const fileUrl = `${UPLOAD_URL_PREFIX}/${filename}`;

    // Metadata from form data
    const alt = formData.get("alt") as string | null;
    const caption = formData.get("caption") as string | null;
    const description = formData.get("description") as string | null;

    await db.insert(blogMedia).values({
      id,
      url: fileUrl,
      type: "image",
      encodingFormat: file.type,
      width: null,
      height: null,
      caption: caption ? { fr: caption } : null,
      description: description ? { fr: description } : null,
      alt: alt ? { fr: alt } : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(auditLog).values({
      id: generateId(),
      action: "blog.media.upload",
      userId,
      targetId: id,
      data: { filename, type: file.type, size: file.size },
      createdAt: new Date(),
    });

    return json(201, { ok: true, id, url: fileUrl });
  } catch (error) {
    console.error("[admin/blog/media]", error);
    return json(500, { error: error instanceof Error ? error.message : "upload_failed" });
  }
};
