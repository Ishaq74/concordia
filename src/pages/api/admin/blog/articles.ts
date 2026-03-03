export const prerender = false;

import type { APIRoute } from "astro";
import { json, guardAdmin, generateId, slugify } from "@lib/admin/api-helpers";
import { getDrizzle } from "@database/drizzle";
import {
  blogPosts,
  blogTranslations,
  blogPostAuthors,
  blogPostCategories,
  blogPostMedia,
  blogAuthors,
  auditLog,
} from "@database/schemas";
import { eq, desc, ilike, count, inArray, and } from "drizzle-orm";

/**
 * GET /api/admin/blog/articles
 * List articles with filters: q, status, featured, home, blog, category, page, perPage
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const db = await getDrizzle();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("perPage") ?? "20")));
  const search = url.searchParams.get("q")?.trim() ?? "";
  const statusFilter = url.searchParams.get("status")?.trim() ?? "";
  const featured = url.searchParams.get("featured");
  const home = url.searchParams.get("home");
  const blog = url.searchParams.get("blog");
  const categoryId = url.searchParams.get("category")?.trim() ?? "";
  const articleId = url.searchParams.get("id")?.trim() ?? "";

  // Single article fetch
  if (articleId) {
    const [article] = await db.select().from(blogPosts).where(eq(blogPosts.id, articleId));
    if (!article) return json(404, { error: "not_found" });

    const translations = await db
      .select()
      .from(blogTranslations)
      .where(eq(blogTranslations.postId, articleId));

    const postAuthors = await db
      .select({ authorId: blogPostAuthors.authorId })
      .from(blogPostAuthors)
      .where(eq(blogPostAuthors.postId, articleId));

    const postCategories = await db
      .select({ categoryId: blogPostCategories.categoryId })
      .from(blogPostCategories)
      .where(eq(blogPostCategories.postId, articleId));

    const postMedia = await db
      .select()
      .from(blogPostMedia)
      .where(eq(blogPostMedia.postId, articleId));

    return json(200, {
      article,
      translations,
      authorIds: postAuthors.map((pa) => pa.authorId),
      categoryIds: postCategories.map((pc) => pc.categoryId),
      media: postMedia,
    });
  }

  // Build conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (search) conditions.push(ilike(blogPosts.slug, `%${search}%`));
  if (statusFilter) conditions.push(eq(blogPosts.status, statusFilter));
  if (featured === "true") conditions.push(eq(blogPosts.isFeatured, true));
  if (featured === "false") conditions.push(eq(blogPosts.isFeatured, false));
  if (home === "true") conditions.push(eq(blogPosts.displayInHome, true));
  if (home === "false") conditions.push(eq(blogPosts.displayInHome, false));
  if (blog === "true") conditions.push(eq(blogPosts.displayInBlog, true));
  if (blog === "false") conditions.push(eq(blogPosts.displayInBlog, false));

  // Category filter: need sub-query
  let postIdsFromCategory: string[] | null = null;
  if (categoryId) {
    const catPosts = await db
      .select({ postId: blogPostCategories.postId })
      .from(blogPostCategories)
      .where(eq(blogPostCategories.categoryId, categoryId));
    postIdsFromCategory = catPosts.map((cp) => cp.postId);
    if (postIdsFromCategory.length === 0) {
      return json(200, { articles: [], total: 0, page, perPage, totalPages: 0 });
    }
    conditions.push(inArray(blogPosts.id, postIdsFromCategory));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = whereClause
    ? await db.select({ value: count() }).from(blogPosts).where(whereClause)
    : await db.select({ value: count() }).from(blogPosts);
  const total = totalResult.value;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const articles = whereClause
    ? await db.select().from(blogPosts).where(whereClause).orderBy(desc(blogPosts.createdAt)).limit(perPage).offset((page - 1) * perPage)
    : await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)).limit(perPage).offset((page - 1) * perPage);

  // Enrich with translations, authors
  const postIds = articles.map((a) => a.id);
  const translationsMap = new Map<string, any[]>();
  const authorsMap = new Map<string, string[]>();
  const categoriesMap = new Map<string, string[]>();

  if (postIds.length > 0) {
    const translations = await db
      .select({ postId: blogTranslations.postId, headline: blogTranslations.headline, inLanguage: blogTranslations.inLanguage })
      .from(blogTranslations)
      .where(inArray(blogTranslations.postId, postIds));

    translations.forEach((tr) => {
      const list = translationsMap.get(tr.postId) ?? [];
      list.push(tr);
      translationsMap.set(tr.postId, list);
    });

    const postAuthorsRows = await db
      .select({ postId: blogPostAuthors.postId, authorId: blogPostAuthors.authorId })
      .from(blogPostAuthors)
      .where(inArray(blogPostAuthors.postId, postIds));

    const authorIds = [...new Set(postAuthorsRows.map((pa) => pa.authorId))];
    const authorNames = new Map<string, string>();
    if (authorIds.length > 0) {
      const authors = await db
        .select({ id: blogAuthors.id, displayName: blogAuthors.displayName })
        .from(blogAuthors)
        .where(inArray(blogAuthors.id, authorIds));
      authors.forEach((a) => {
        const dn = a.displayName;
        authorNames.set(a.id, typeof dn === "string" ? dn : (dn as Record<string, string>)?.fr || Object.values(dn as Record<string, string>)[0] || "—");
      });
    }

    postAuthorsRows.forEach((pa) => {
      const list = authorsMap.get(pa.postId) ?? [];
      const name = authorNames.get(pa.authorId);
      if (name) list.push(name);
      authorsMap.set(pa.postId, list);
    });

    const postCategoryRows = await db
      .select({ postId: blogPostCategories.postId, categoryId: blogPostCategories.categoryId })
      .from(blogPostCategories)
      .where(inArray(blogPostCategories.postId, postIds));

    postCategoryRows.forEach((pc) => {
      const list = categoriesMap.get(pc.postId) ?? [];
      list.push(pc.categoryId);
      categoriesMap.set(pc.postId, list);
    });
  }

  const enriched = articles.map((a) => ({
    ...a,
    translations: translationsMap.get(a.id) ?? [],
    authors: authorsMap.get(a.id) ?? [],
    categoryIds: categoriesMap.get(a.id) ?? [],
  }));

  return json(200, { articles: enriched, total, page, perPage, totalPages });
};

/**
 * POST /api/admin/blog/articles
 * Actions: create, update, delete, publish, unpublish, duplicate
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
      const slug = slugify(String(payload.slug || payload.title || id));
      const status = String(payload.status || "draft");
      const inLanguage = String(payload.inLanguage || "fr");

      await db.insert(blogPosts).values({
        id,
        slug,
        status,
        inLanguage,
        publishedAt: status === "published" ? new Date() : null,
        displayInHome: Boolean(payload.displayInHome),
        displayInBlog: payload.displayInBlog !== false,
        isFeatured: Boolean(payload.isFeatured),
        allowComments: payload.allowComments !== false,
        readingTime: payload.readingTime ? String(payload.readingTime) : null,
        wordCount: payload.wordCount ? String(payload.wordCount) : null,
        license: payload.license ? String(payload.license) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Translations
      const translations = payload.translations as Array<{
        inLanguage: string;
        headline: string;
        alternativeHeadline?: string;
        articleBody: string;
        excerpt: string;
        seoTitle?: string;
        seoDescription?: string;
        seoKeywords?: string;
        canonicalUrl?: string;
      }> | undefined;

      if (translations && Array.isArray(translations)) {
        for (const tr of translations) {
          await db.insert(blogTranslations).values({
            id: generateId(),
            postId: id,
            inLanguage: tr.inLanguage || inLanguage,
            headline: tr.headline,
            alternativeHeadline: tr.alternativeHeadline || null,
            articleBody: tr.articleBody,
            excerpt: tr.excerpt,
            seoTitle: tr.seoTitle || null,
            seoDescription: tr.seoDescription || null,
            seoKeywords: tr.seoKeywords || null,
            canonicalUrl: tr.canonicalUrl || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      // Authors
      const authorIds = payload.authorIds as string[] | undefined;
      if (authorIds && Array.isArray(authorIds)) {
        for (const authorId of authorIds) {
          await db.insert(blogPostAuthors).values({ postId: id, authorId });
        }
      }

      // Categories
      const categoryIds = payload.categoryIds as string[] | undefined;
      if (categoryIds && Array.isArray(categoryIds)) {
        for (const categoryId of categoryIds) {
          await db.insert(blogPostCategories).values({ postId: id, categoryId });
        }
      }

      // Media
      const mediaItems = payload.media as Array<{ mediaId: string; type: string; position?: string }> | undefined;
      if (mediaItems && Array.isArray(mediaItems)) {
        for (const m of mediaItems) {
          await db.insert(blogPostMedia).values({
            postId: id,
            mediaId: m.mediaId,
            type: m.type,
            position: m.position || null,
          });
        }
      }

      // Audit log
      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.article.create",
        userId,
        targetId: id,
        data: { slug, status },
        createdAt: new Date(),
      });

      return json(201, { ok: true, id, slug });
    }

    // ── UPDATE ──
    if (action === "update") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });

      const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
      if (!existing) return json(404, { error: "not_found" });

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (payload.slug !== undefined) updateData.slug = slugify(String(payload.slug));
      if (payload.status !== undefined) {
        updateData.status = String(payload.status);
        if (payload.status === "published" && !existing.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }
      if (payload.displayInHome !== undefined) updateData.displayInHome = Boolean(payload.displayInHome);
      if (payload.displayInBlog !== undefined) updateData.displayInBlog = Boolean(payload.displayInBlog);
      if (payload.isFeatured !== undefined) updateData.isFeatured = Boolean(payload.isFeatured);
      if (payload.allowComments !== undefined) updateData.allowComments = Boolean(payload.allowComments);
      if (payload.inLanguage !== undefined) updateData.inLanguage = String(payload.inLanguage);
      if (payload.readingTime !== undefined) updateData.readingTime = payload.readingTime ? String(payload.readingTime) : null;
      if (payload.wordCount !== undefined) updateData.wordCount = payload.wordCount ? String(payload.wordCount) : null;
      if (payload.license !== undefined) updateData.license = payload.license ? String(payload.license) : null;

      await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id));

      // Update translations (replace strategy: delete old, insert new)
      const translations = payload.translations as Array<{
        id?: string;
        inLanguage: string;
        headline: string;
        alternativeHeadline?: string;
        articleBody: string;
        excerpt: string;
        seoTitle?: string;
        seoDescription?: string;
        seoKeywords?: string;
        canonicalUrl?: string;
      }> | undefined;

      if (translations && Array.isArray(translations)) {
        await db.delete(blogTranslations).where(eq(blogTranslations.postId, id));
        for (const tr of translations) {
          await db.insert(blogTranslations).values({
            id: tr.id || generateId(),
            postId: id,
            inLanguage: tr.inLanguage,
            headline: tr.headline,
            alternativeHeadline: tr.alternativeHeadline || null,
            articleBody: tr.articleBody,
            excerpt: tr.excerpt,
            seoTitle: tr.seoTitle || null,
            seoDescription: tr.seoDescription || null,
            seoKeywords: tr.seoKeywords || null,
            canonicalUrl: tr.canonicalUrl || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      // Update authors (replace)
      if (payload.authorIds !== undefined) {
        await db.delete(blogPostAuthors).where(eq(blogPostAuthors.postId, id));
        const authorIds = payload.authorIds as string[];
        if (Array.isArray(authorIds)) {
          for (const authorId of authorIds) {
            await db.insert(blogPostAuthors).values({ postId: id, authorId });
          }
        }
      }

      // Update categories (replace)
      if (payload.categoryIds !== undefined) {
        await db.delete(blogPostCategories).where(eq(blogPostCategories.postId, id));
        const categoryIds = payload.categoryIds as string[];
        if (Array.isArray(categoryIds)) {
          for (const categoryId of categoryIds) {
            await db.insert(blogPostCategories).values({ postId: id, categoryId });
          }
        }
      }

      // Update media (replace)
      if (payload.media !== undefined) {
        await db.delete(blogPostMedia).where(eq(blogPostMedia.postId, id));
        const mediaItems = payload.media as Array<{ mediaId: string; type: string; position?: string }>;
        if (Array.isArray(mediaItems)) {
          for (const m of mediaItems) {
            await db.insert(blogPostMedia).values({
              postId: id,
              mediaId: m.mediaId,
              type: m.type,
              position: m.position || null,
            });
          }
        }
      }

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.article.update",
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

      // Delete related data first
      await db.delete(blogTranslations).where(eq(blogTranslations.postId, id));
      await db.delete(blogPostAuthors).where(eq(blogPostAuthors.postId, id));
      await db.delete(blogPostCategories).where(eq(blogPostCategories.postId, id));
      await db.delete(blogPostMedia).where(eq(blogPostMedia.postId, id));
      await db.delete(blogPosts).where(eq(blogPosts.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.article.delete",
        userId,
        targetId: id,
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    // ── PUBLISH ──
    if (action === "publish") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });
      await db.update(blogPosts).set({
        status: "published",
        publishedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(blogPosts.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.article.publish",
        userId,
        targetId: id,
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    // ── UNPUBLISH ──
    if (action === "unpublish") {
      const id = String(payload.id ?? "").trim();
      if (!id) return json(400, { error: "missing_id" });
      await db.update(blogPosts).set({
        status: "draft",
        updatedAt: new Date(),
      }).where(eq(blogPosts.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.article.unpublish",
        userId,
        targetId: id,
        createdAt: new Date(),
      });

      return json(200, { ok: true });
    }

    // ── DUPLICATE ──
    if (action === "duplicate") {
      const sourceId = String(payload.id ?? "").trim();
      if (!sourceId) return json(400, { error: "missing_id" });

      const [source] = await db.select().from(blogPosts).where(eq(blogPosts.id, sourceId));
      if (!source) return json(404, { error: "not_found" });

      const newId = generateId();
      const newSlug = `${source.slug}-copy-${Date.now().toString(36)}`;

      await db.insert(blogPosts).values({
        ...source,
        id: newId,
        slug: newSlug,
        status: "draft",
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Duplicate translations
      const sourceTr = await db.select().from(blogTranslations).where(eq(blogTranslations.postId, sourceId));
      for (const tr of sourceTr) {
        await db.insert(blogTranslations).values({
          ...tr,
          id: generateId(),
          postId: newId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Duplicate relations
      const sourceAuthors = await db.select().from(blogPostAuthors).where(eq(blogPostAuthors.postId, sourceId));
      for (const pa of sourceAuthors) {
        await db.insert(blogPostAuthors).values({ postId: newId, authorId: pa.authorId });
      }

      const sourceCategories = await db.select().from(blogPostCategories).where(eq(blogPostCategories.postId, sourceId));
      for (const pc of sourceCategories) {
        await db.insert(blogPostCategories).values({ postId: newId, categoryId: pc.categoryId });
      }

      const sourceMedia = await db.select().from(blogPostMedia).where(eq(blogPostMedia.postId, sourceId));
      for (const m of sourceMedia) {
        await db.insert(blogPostMedia).values({ postId: newId, mediaId: m.mediaId, type: m.type, position: m.position });
      }

      await db.insert(auditLog).values({
        id: generateId(),
        action: "blog.article.duplicate",
        userId,
        targetId: newId,
        data: { sourceId },
        createdAt: new Date(),
      });

      return json(201, { ok: true, id: newId, slug: newSlug });
    }

    return json(400, { error: "unknown_action" });
  } catch (error) {
    console.error("[admin/blog/articles]", error);
    const message = error instanceof Error ? error.message : "unknown_error";
    return json(500, { error: message });
  }
};
