export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminUser } from "@lib/admin/permissions";
import { getDrizzle } from "@database/drizzle";
import {
  blogAuthors,
  blogPostAuthors,
  auditLog,
} from "@database/schemas";
import { eq, desc, ilike, count, inArray, and } from "drizzle-orm";

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

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * GET /api/admin/blog/authors
 * List authors with filters: q, featured, home, blog, page, perPage
 * Or fetch single: ?id=xxx
 * Or all for selectors: ?all=true
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
  const authorId = url.searchParams.get("id")?.trim() ?? "";
  const all = url.searchParams.get("all");

  // Single author fetch
  if (authorId) {
    const [author] = await db.select().from(blogAuthors).where(eq(blogAuthors.id, authorId));
    if (!author) return json(404, { error: "not_found" });

    const [articleCount] = await db
      .select({ value: count() })
      .from(blogPostAuthors)
      .where(eq(blogPostAuthors.authorId, authorId));

    return json(200, { author, articleCount: articleCount.value });
  }

  // All authors (for selectors)
  if (all === "true") {
    const authors = await db
      .select({ id: blogAuthors.id, slug: blogAuthors.slug, displayName: blogAuthors.displayName })
      .from(blogAuthors)
      .orderBy(blogAuthors.slug);
    return json(200, { authors });
  }

  // Build conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (search) {
    conditions.push(ilike(blogAuthors.slug, `%${search}%`));
  }
  if (featured === "true") conditions.push(eq(blogAuthors.isFeatured, true));
  if (featured === "false") conditions.push(eq(blogAuthors.isFeatured, false));
  if (home === "true") conditions.push(eq(blogAuthors.displayInHome, true));
  if (home === "false") conditions.push(eq(blogAuthors.displayInHome, false));
  if (blog === "true") conditions.push(eq(blogAuthors.displayInBlog, true));
  if (blog === "false") conditions.push(eq(blogAuthors.displayInBlog, false));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = whereClause
    ? await db.select({ value: count() }).from(blogAuthors).where(whereClause)
    : await db.select({ value: count() }).from(blogAuthors);
  const total = totalResult.value;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const authors = whereClause
    ? await db.select().from(blogAuthors).where(whereClause).orderBy(desc(blogAuthors.createdAt)).limit(perPage).offset((page - 1) * perPage)
    : await db.select().from(blogAuthors).orderBy(desc(blogAuthors.createdAt)).limit(perPage).offset((page - 1) * perPage);

  // Enrich with article counts
  const authorIds = authors.map((a) => a.id);
  const articleCountMap = new Map<string, number>();
  if (authorIds.length > 0) {
    const counts = await db
      .select({ authorId: blogPostAuthors.authorId, count: count() })
      .from(blogPostAuthors)
      .where(inArray(blogPostAuthors.authorId, authorIds))
      .groupBy(blogPostAuthors.authorId);
    counts.forEach((c) => articleCountMap.set(c.authorId, c.count));
  }

  const enriched = authors.map((a) => ({
    ...a,
    articleCount: articleCountMap.get(a.id) ?? 0,
  }));

  return json(200, { authors: enriched, total, page, perPage, totalPages });
};

/**
 * POST /api/admin/blog/authors
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

      const displayName = payload.displayName;
      if (!displayName) return json(400, { error: "missing_displayName" });

      await db.insert(blogAuthors).values({
        id,
        slug,
        displayName: displayName as any,
        givenName: (payload.givenName as any) || null,
        familyName: (payload.familyName as any) || null,
        bio: (payload.bio as any) || null,
        jobTitle: (payload.jobTitle as any) || null,
        email: payload.email ? String(payload.email) : null,
        avatarId: payload.avatarId ? String(payload.avatarId) : null,
        avatarUrl: payload.avatarUrl ? String(payload.avatarUrl) : null,
        website: payload.website ? String(payload.website) : null,
        sameAs: (payload.sameAs as any) || null,
        worksForId: payload.worksForId ? String(payload.worksForId) : null,
        displayInHome: Boolean(payload.displayInHome),
        displayInBlog: payload.displayInBlog !== false,
        isFeatured: Boolean(payload.isFeatured),
        seoTitle: (payload.seoTitle as any) || null,
        seoDescription: (payload.seoDescription as any) || null,
        seoKeywords: (payload.seoKeywords as any) || null,
        canonicalUrl: (payload.canonicalUrl as any) || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.author.create",
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

      const [existing] = await db.select().from(blogAuthors).where(eq(blogAuthors.id, id));
      if (!existing) return json(404, { error: "not_found" });

      const updateData: Record<string, unknown> = { updatedAt: new Date() };

      if (payload.slug !== undefined) updateData.slug = slugify(String(payload.slug));
      if (payload.displayName !== undefined) updateData.displayName = payload.displayName;
      if (payload.givenName !== undefined) updateData.givenName = payload.givenName;
      if (payload.familyName !== undefined) updateData.familyName = payload.familyName;
      if (payload.bio !== undefined) updateData.bio = payload.bio;
      if (payload.jobTitle !== undefined) updateData.jobTitle = payload.jobTitle;
      if (payload.email !== undefined) updateData.email = payload.email || null;
      if (payload.avatarId !== undefined) updateData.avatarId = payload.avatarId || null;
      if (payload.avatarUrl !== undefined) updateData.avatarUrl = payload.avatarUrl || null;
      if (payload.website !== undefined) updateData.website = payload.website || null;
      if (payload.sameAs !== undefined) updateData.sameAs = payload.sameAs;
      if (payload.worksForId !== undefined) updateData.worksForId = payload.worksForId || null;
      if (payload.displayInHome !== undefined) updateData.displayInHome = Boolean(payload.displayInHome);
      if (payload.displayInBlog !== undefined) updateData.displayInBlog = Boolean(payload.displayInBlog);
      if (payload.isFeatured !== undefined) updateData.isFeatured = Boolean(payload.isFeatured);
      if (payload.seoTitle !== undefined) updateData.seoTitle = payload.seoTitle;
      if (payload.seoDescription !== undefined) updateData.seoDescription = payload.seoDescription;
      if (payload.seoKeywords !== undefined) updateData.seoKeywords = payload.seoKeywords;
      if (payload.canonicalUrl !== undefined) updateData.canonicalUrl = payload.canonicalUrl;

      await db.update(blogAuthors).set(updateData).where(eq(blogAuthors.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.author.update",
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

      // Remove post-author associations
      await db.delete(blogPostAuthors).where(eq(blogPostAuthors.authorId, id));
      // Remove the author
      await db.delete(blogAuthors).where(eq(blogAuthors.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.author.delete",
        userId,
        targetId: id,
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    return json(400, { error: "unknown_action" });
  } catch (error) {
    console.error("[admin/blog/authors]", error);
    const message = error instanceof Error ? error.message : "unknown_error";
    return json(500, { error: message });
  }
};
