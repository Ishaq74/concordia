export const prerender = false;

import type { APIRoute } from "astro";
import { json, guardAdmin, generateId } from "@lib/admin/api-helpers";
import { getDrizzle } from "@database/drizzle";
import { blogMedia, auditLog } from "@database/schemas";
import { eq, desc, count, ilike } from "drizzle-orm";
import { deleteStoredUpload, storeImageUpload, UploadError } from "@lib/media/upload";


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
        await deleteStoredUpload(existing.url, "blog");

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

    const id = generateId();
    const { filename, url: fileUrl } = await storeImageUpload(file, "blog");

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
    if (error instanceof UploadError) return json(400, { error: error.code });
    return json(500, { error: error instanceof Error ? error.message : "upload_failed" });
  }
};
