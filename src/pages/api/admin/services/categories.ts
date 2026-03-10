export const prerender = false;

import type { APIRoute } from "astro";
import { json, guardAdmin, generateId, slugify } from "@lib/admin/api-helpers";
import { getDrizzle } from "@database/drizzle";
import {
  servicesCategories,
  servicesListings,
  auditLog,
} from "@database/schemas";
import { eq, desc, ilike, count, inArray, and } from "drizzle-orm";

/**
 * GET /api/admin/services/categories
 * List categories with filters: q, featured, home, menu, parent, page, perPage
 * Or fetch single: ?id=xxx
 * Or fetch all: ?all=true
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const db = await getDrizzle();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("perPage") ?? "20")));
  const search = url.searchParams.get("q")?.trim() ?? "";
  const featured = url.searchParams.get("featured");
  const home = url.searchParams.get("home");
  const menu = url.searchParams.get("menu");
  const parentId = url.searchParams.get("parent")?.trim() ?? "";
  const categoryId = url.searchParams.get("id")?.trim() ?? "";
  const all = url.searchParams.get("all");

  // Single category fetch
  if (categoryId) {
    const [category] = await db.select().from(servicesCategories).where(eq(servicesCategories.id, categoryId));
    if (!category) return json(404, { error: "not_found" });

    const [serviceCount] = await db
      .select({ value: count() })
      .from(servicesListings)
      .where(eq(servicesListings.categoryId, categoryId));

    return json(200, { category, serviceCount: serviceCount.value });
  }

  // All categories (for selectors / dropdowns)
  if (all === "true") {
    const categories = await db
      .select({ id: servicesCategories.id, slug: servicesCategories.slug, name: servicesCategories.name, parentId: servicesCategories.parentId })
      .from(servicesCategories)
      .orderBy(servicesCategories.slug);
    return json(200, { categories });
  }

  // Build conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (search) conditions.push(ilike(servicesCategories.slug, `%${search}%`));
  if (featured === "true") conditions.push(eq(servicesCategories.isFeatured, true));
  if (featured === "false") conditions.push(eq(servicesCategories.isFeatured, false));
  if (home === "true") conditions.push(eq(servicesCategories.displayInHome, true));
  if (home === "false") conditions.push(eq(servicesCategories.displayInHome, false));
  if (menu === "true") conditions.push(eq(servicesCategories.displayInMenu, true));
  if (menu === "false") conditions.push(eq(servicesCategories.displayInMenu, false));
  if (parentId === "root") conditions.push(eq(servicesCategories.parentId, ""));
  else if (parentId) conditions.push(eq(servicesCategories.parentId, parentId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = whereClause
    ? await db.select({ value: count() }).from(servicesCategories).where(whereClause)
    : await db.select({ value: count() }).from(servicesCategories);
  const total = totalResult.value;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const categories = whereClause
    ? await db.select().from(servicesCategories).where(whereClause).orderBy(desc(servicesCategories.createdAt)).limit(perPage).offset((page - 1) * perPage)
    : await db.select().from(servicesCategories).orderBy(desc(servicesCategories.createdAt)).limit(perPage).offset((page - 1) * perPage);

  // Enrich with service counts
  const categoryIds = categories.map((c) => c.id);
  const serviceCountMap = new Map<string, number>();
  if (categoryIds.length > 0) {
    const counts = await db
      .select({ categoryId: servicesListings.categoryId, count: count() })
      .from(servicesListings)
      .where(inArray(servicesListings.categoryId, categoryIds))
      .groupBy(servicesListings.categoryId);
    counts.forEach((c) => serviceCountMap.set(c.categoryId!, c.count));
  }

  const enriched = categories.map((c) => ({
    ...c,
    serviceCount: serviceCountMap.get(c.id) ?? 0,
  }));

  return json(200, { categories: enriched, total, page, perPage, totalPages });
};

/**
 * POST /api/admin/services/categories
 * Actions: create, update, delete
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
    // ── CREATE ──
    if (action === "create") {
      const id = generateId();
      const slug = slugify(String(payload.slug || payload.name || id));

      await db.insert(servicesCategories).values({
        id,
        slug,
        name: (payload.name as Record<string, string>) ?? {},
        description: (payload.description as Record<string, string>) || null,
        icon: (payload.icon as string) || null,
        featuredImageId: (payload.featuredImageId as string) || null,
        parentId: (payload.parentId as string) || null,
        sortOrder: Number(payload.sortOrder ?? 0),
        displayInHome: Boolean(payload.displayInHome),
        displayInMenu: payload.displayInMenu !== false,
        isActive: payload.isActive !== false,
        isFeatured: Boolean(payload.isFeatured),
        seoTitle: (payload.seoTitle as Record<string, string>) || null,
        seoDescription: (payload.seoDescription as Record<string, string>) || null,
      });

      await db.insert(auditLog).values({
        id: generateId(),
        userId,
        action: "service_category.create",
        targetId: id,
        data: { slug },
        createdAt: new Date(),
      });

      return json(201, { id, slug });
    }

    // ── UPDATE ──
    if (action === "update") {
      const id = String(payload.id ?? "");
      if (!id) return json(400, { error: "missing_id" });

      const updates: Record<string, unknown> = {};
      if (payload.slug !== undefined) updates.slug = slugify(String(payload.slug));
      if (payload.name !== undefined) updates.name = payload.name;
      if (payload.description !== undefined) updates.description = payload.description;
      if (payload.icon !== undefined) updates.icon = payload.icon;
      if (payload.parentId !== undefined) updates.parentId = payload.parentId || null;
      if (payload.sortOrder !== undefined) updates.sortOrder = Number(payload.sortOrder);
      if (payload.displayInHome !== undefined) updates.displayInHome = Boolean(payload.displayInHome);
      if (payload.displayInMenu !== undefined) updates.displayInMenu = Boolean(payload.displayInMenu);
      if (payload.isActive !== undefined) updates.isActive = Boolean(payload.isActive);
      if (payload.isFeatured !== undefined) updates.isFeatured = Boolean(payload.isFeatured);
      if (payload.seoTitle !== undefined) updates.seoTitle = payload.seoTitle;
      if (payload.seoDescription !== undefined) updates.seoDescription = payload.seoDescription;
      updates.updatedAt = new Date();

      await db.update(servicesCategories).set(updates).where(eq(servicesCategories.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        userId,
        action: "service_category.update",
        targetId: id,
        data: { fields: Object.keys(updates) },
        createdAt: new Date(),
      });

      return json(200, { updated: true });
    }

    // ── DELETE ──
    if (action === "delete") {
      const id = String(payload.id ?? "");
      if (!id) return json(400, { error: "missing_id" });

      // Unlink services from this category
      await db.update(servicesListings).set({ categoryId: null }).where(eq(servicesListings.categoryId, id));
      await db.delete(servicesCategories).where(eq(servicesCategories.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        userId,
        action: "service_category.delete",
        targetId: id,
        createdAt: new Date(),
      });

      return json(200, { deleted: true });
    }

    return json(400, { error: "unknown_action" });
  } catch (err: any) {
    console.error("[admin/services/categories] POST error:", err);
    return json(500, { error: "internal_error", message: err.message });
  }
};
