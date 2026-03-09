export const prerender = false;

import type { APIRoute } from "astro";
import { json, guardAdmin, guardPermission, generateId } from "@lib/admin/api-helpers";
import { getDrizzle } from "@database/drizzle";
import { servicesReviews, auditLog } from "@database/schemas";
import { eq, desc, count, and, ilike } from "drizzle-orm";

/**
 * GET /api/admin/services/reviews
 * List reviews with filters: status, serviceId, q, page, perPage
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const db = await getDrizzle();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("perPage") ?? "20")));
  const statusFilter = url.searchParams.get("status")?.trim() ?? "";
  const serviceId = url.searchParams.get("serviceId")?.trim() ?? "";
  const search = url.searchParams.get("q")?.trim() ?? "";

  const conditions: ReturnType<typeof eq>[] = [];
  if (statusFilter) conditions.push(eq(servicesReviews.status, statusFilter));
  if (serviceId) conditions.push(eq(servicesReviews.serviceId, serviceId));
  if (search) {
    conditions.push(ilike(servicesReviews.authorName, `%${search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = whereClause
    ? await db.select({ value: count() }).from(servicesReviews).where(whereClause)
    : await db.select({ value: count() }).from(servicesReviews);
  const total = totalResult.value;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const reviews = whereClause
    ? await db.select().from(servicesReviews).where(whereClause).orderBy(desc(servicesReviews.createdAt)).limit(perPage).offset((page - 1) * perPage)
    : await db.select().from(servicesReviews).orderBy(desc(servicesReviews.createdAt)).limit(perPage).offset((page - 1) * perPage);

  return json(200, { reviews, total, page, perPage, totalPages });
};

/**
 * POST /api/admin/services/reviews
 * Actions: approve, reject, delete
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  // Moderation permission check
  const permGuard = guardPermission(locals, "moderation.action");
  if (permGuard) return permGuard;

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
    if (action === "approve") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      const [existing] = await db.select().from(servicesReviews).where(eq(servicesReviews.id, id));
      if (!existing) return json(404, { error: "not_found" });

      await db
        .update(servicesReviews)
        .set({ status: "approved", updatedAt: new Date() })
        .where(eq(servicesReviews.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "service.review.approve",
        userId,
        targetId: id,
        data: { serviceId: existing.serviceId, author: existing.authorName },
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    if (action === "reject") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      const [existing] = await db.select().from(servicesReviews).where(eq(servicesReviews.id, id));
      if (!existing) return json(404, { error: "not_found" });

      await db
        .update(servicesReviews)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(servicesReviews.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "service.review.reject",
        userId,
        targetId: id,
        data: { serviceId: existing.serviceId },
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    if (action === "delete") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      await db.delete(servicesReviews).where(eq(servicesReviews.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "service.review.delete",
        userId,
        targetId: id,
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    return json(400, { error: "unknown_action" });
  } catch (error) {
    console.error("[admin/services/reviews]", error);
    const message = error instanceof Error ? error.message : "unknown_error";
    return json(500, { error: message });
  }
};
