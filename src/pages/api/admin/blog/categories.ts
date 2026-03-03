export const prerender = false;

import type { APIRoute } from "astro";
import { json, guardAdmin, generateId, slugify } from "@lib/admin/api-helpers";
import { getDrizzle } from "@database/drizzle";
import {
  blogCategories,
  blogPostCategories,
  auditLog,
} from "@database/schemas";
import { eq, desc, ilike, count, inArray, and } from "drizzle-orm";

/**
 * GET /api/admin/blog/categories
 * List categories with filters: q, featured, home, blog, menu, parent, page, perPage
 * Or fetch single: ?id=xxx
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
  const blog = url.searchParams.get("blog");
  const menu = url.searchParams.get("menu");
  const parentId = url.searchParams.get("parent")?.trim() ?? "";
  const categoryId = url.searchParams.get("id")?.trim() ?? "";
  const all = url.searchParams.get("all"); // ?all=true to get all for selectors

  // Single category fetch
  if (categoryId) {
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.id, categoryId));
    if (!category) return json(404, { error: "not_found" });

    // Count articles
    const [articleCount] = await db
      .select({ value: count() })
      .from(blogPostCategories)
      .where(eq(blogPostCategories.categoryId, categoryId));

    return json(200, { category, articleCount: articleCount.value });
  }

  // All categories (for selectors / dropdowns)
  if (all === "true") {
    const categories = await db
      .select({ id: blogCategories.id, slug: blogCategories.slug, name: blogCategories.name, parentId: blogCategories.parentId })
      .from(blogCategories)
      .orderBy(blogCategories.slug);
    return json(200, { categories });
  }

  // Build conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (search) conditions.push(ilike(blogCategories.slug, `%${search}%`));
  if (featured === "true") conditions.push(eq(blogCategories.isFeatured, true));
  if (featured === "false") conditions.push(eq(blogCategories.isFeatured, false));
  if (home === "true") conditions.push(eq(blogCategories.displayInHome, true));
  if (home === "false") conditions.push(eq(blogCategories.displayInHome, false));
  if (blog === "true") conditions.push(eq(blogCategories.displayInBlog, true));
  if (blog === "false") conditions.push(eq(blogCategories.displayInBlog, false));
  if (menu === "true") conditions.push(eq(blogCategories.displayInMenu, true));
  if (menu === "false") conditions.push(eq(blogCategories.displayInMenu, false));
  if (parentId === "root") conditions.push(eq(blogCategories.parentId, ""));
  else if (parentId) conditions.push(eq(blogCategories.parentId, parentId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = whereClause
    ? await db.select({ value: count() }).from(blogCategories).where(whereClause)
    : await db.select({ value: count() }).from(blogCategories);
  const total = totalResult.value;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const categories = whereClause
    ? await db.select().from(blogCategories).where(whereClause).orderBy(desc(blogCategories.createdAt)).limit(perPage).offset((page - 1) * perPage)
    : await db.select().from(blogCategories).orderBy(desc(blogCategories.createdAt)).limit(perPage).offset((page - 1) * perPage);

  // Enrich with article counts
  const categoryIds = categories.map((c) => c.id);
  const articleCountMap = new Map<string, number>();
  if (categoryIds.length > 0) {
    const counts = await db
      .select({ categoryId: blogPostCategories.categoryId, count: count() })
      .from(blogPostCategories)
      .where(inArray(blogPostCategories.categoryId, categoryIds))
      .groupBy(blogPostCategories.categoryId);
    counts.forEach((c) => articleCountMap.set(c.categoryId, c.count));
  }

  const enriched = categories.map((c) => ({
    ...c,
    articleCount: articleCountMap.get(c.id) ?? 0,
  }));

  return json(200, { categories: enriched, total, page, perPage, totalPages });
};

/**
 * POST /api/admin/blog/categories
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
      const slug = slugify(String(payload.slug || ""));
      if (!slug) return json(400, { error: "missing_slug" });

      // Name is multilingual jsonb: { fr: "...", en: "...", ... }
      const name = payload.name;
      if (!name) return json(400, { error: "missing_name" });

      await db.insert(blogCategories).values({
        id,
        slug,
        name: name as any,
        description: (payload.description as any) || null,
        featuredImageId: payload.featuredImageId ? String(payload.featuredImageId) : null,
        displayInHome: Boolean(payload.displayInHome),
        displayInMenu: payload.displayInMenu !== false,
        displayInBlog: payload.displayInBlog !== false,
        isFeatured: Boolean(payload.isFeatured),
        parentId: payload.parentId ? String(payload.parentId) : null,
        seoTitle: (payload.seoTitle as any) || null,
        seoDescription: (payload.seoDescription as any) || null,
        seoKeywords: (payload.seoKeywords as any) || null,
        canonicalUrl: (payload.canonicalUrl as any) || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.category.create",
        userId,
        targetId: id,
        data: { slug },
        createdAt: new Date(),
      });

      return json(201, { ok: true, id, slug });
    }

    // ── UPDATE ──
    if (action === "update") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      const [existing] = await db.select().from(blogCategories).where(eq(blogCategories.id, id));
      if (!existing) return json(404, { error: "not_found" });

      const updateData: Record<string, unknown> = { updatedAt: new Date() };

      if (payload.slug !== undefined) updateData.slug = slugify(String(payload.slug));
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.description !== undefined) updateData.description = payload.description;
      if (payload.featuredImageId !== undefined) updateData.featuredImageId = payload.featuredImageId ? String(payload.featuredImageId) : null;
      if (payload.displayInHome !== undefined) updateData.displayInHome = Boolean(payload.displayInHome);
      if (payload.displayInMenu !== undefined) updateData.displayInMenu = Boolean(payload.displayInMenu);
      if (payload.displayInBlog !== undefined) updateData.displayInBlog = Boolean(payload.displayInBlog);
      if (payload.isFeatured !== undefined) updateData.isFeatured = Boolean(payload.isFeatured);
      if (payload.parentId !== undefined) updateData.parentId = payload.parentId ? String(payload.parentId) : null;
      if (payload.seoTitle !== undefined) updateData.seoTitle = payload.seoTitle;
      if (payload.seoDescription !== undefined) updateData.seoDescription = payload.seoDescription;
      if (payload.seoKeywords !== undefined) updateData.seoKeywords = payload.seoKeywords;
      if (payload.canonicalUrl !== undefined) updateData.canonicalUrl = payload.canonicalUrl;

      await db.update(blogCategories).set(updateData).where(eq(blogCategories.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.category.update",
        userId,
        targetId: id,
        data: { changes: Object.keys(updateData) },
        createdAt: new Date(),
      });

      return json(200, { ok: true, id });
    }

    // ── DELETE ──
    if (action === "delete") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      // Remove post-category associations
      await db.delete(blogPostCategories).where(eq(blogPostCategories.categoryId, id));
      // Remove the category
      await db.delete(blogCategories).where(eq(blogCategories.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.category.delete",
        userId,
        targetId: id,
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    return json(400, { error: "unknown_action" });
  } catch (error) {
    console.error("[admin/blog/categories]", error);
    const message = error instanceof Error ? error.message : "unknown_error";
    return json(500, { error: message });
  }
};
