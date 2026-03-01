export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminUser } from "@lib/admin/permissions";
import { getDrizzle } from "@database/drizzle";
import { blogComments, auditLog } from "@database/schemas";
import { eq, desc, ilike, count, and, or } from "drizzle-orm";

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

/**
 * GET /api/admin/blog/comments
 * params: q, status, type, page, perPage
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const db = await getDrizzle();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("perPage") ?? "25")));
  const search = url.searchParams.get("q")?.trim() ?? "";
  const statusFilter = url.searchParams.get("status")?.trim() ?? "";
  const typeFilter = url.searchParams.get("type")?.trim() ?? "";

  const conditions: ReturnType<typeof eq>[] = [];
  if (search) {
    conditions.push(
      or(
        ilike(blogComments.authorName, `%${search}%`),
        ilike(blogComments.authorEmail, `%${search}%`),
      )!
    );
  }
  if (statusFilter) conditions.push(eq(blogComments.status, statusFilter));
  if (typeFilter) conditions.push(eq(blogComments.postType, typeFilter));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = whereClause
    ? await db.select({ value: count() }).from(blogComments).where(whereClause)
    : await db.select({ value: count() }).from(blogComments);
  const total = totalResult.value;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const comments = whereClause
    ? await db.select().from(blogComments).where(whereClause).orderBy(desc(blogComments.createdAt)).limit(perPage).offset((page - 1) * perPage)
    : await db.select().from(blogComments).orderBy(desc(blogComments.createdAt)).limit(perPage).offset((page - 1) * perPage);

  // Stats
  const [pendingCount] = await db.select({ value: count() }).from(blogComments).where(eq(blogComments.status, "pending"));
  const [approvedCount] = await db.select({ value: count() }).from(blogComments).where(eq(blogComments.status, "approved"));
  const [rejectedCount] = await db.select({ value: count() }).from(blogComments).where(eq(blogComments.status, "rejected"));

  return json(200, {
    comments,
    total,
    page,
    perPage,
    totalPages,
    stats: {
      pending: pendingCount.value,
      approved: approvedCount.value,
      rejected: rejectedCount.value,
    },
  });
};

/**
 * POST /api/admin/blog/comments
 * Actions: approve, reject, delete
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: "invalid_body" });
  }

  const action = String(payload.action ?? "").trim();
  if (!action) return json(400, { error: "missing_action" });

  const db = await getDrizzle();
  const userId = locals.user?.id ?? "system";

  try {
    // ── APPROVE ──
    if (action === "approve") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      const [existing] = await db.select().from(blogComments).where(eq(blogComments.id, id));
      if (!existing) return json(404, { error: "not_found" });

      await db.update(blogComments).set({ status: "approved", updatedAt: new Date() }).where(eq(blogComments.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.comment.approve",
        userId,
        targetId: id,
        data: { postId: existing.postId, author: existing.authorName },
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    // ── REJECT ──
    if (action === "reject") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      const [existing] = await db.select().from(blogComments).where(eq(blogComments.id, id));
      if (!existing) return json(404, { error: "not_found" });

      await db.update(blogComments).set({ status: "rejected", updatedAt: new Date() }).where(eq(blogComments.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.comment.reject",
        userId,
        targetId: id,
        data: { postId: existing.postId, author: existing.authorName },
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    // ── DELETE ──
    if (action === "delete") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      const [existing] = await db.select().from(blogComments).where(eq(blogComments.id, id));
      if (!existing) return json(404, { error: "not_found" });

      await db.delete(blogComments).where(eq(blogComments.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.comment.delete",
        userId,
        targetId: id,
        data: { postId: existing.postId, author: existing.authorName },
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    return json(400, { error: "unknown_action" });
  } catch (error) {
    console.error("[admin/blog/comments]", error);
    const message = error instanceof Error ? error.message : "unknown_error";
    return json(500, { error: message });
  }
};
