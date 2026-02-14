import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import {
  article,
  articleContent,
  articleCategoryLink,
} from "@database/schemas";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** List published articles with pagination and optional search. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const lang = url.searchParams.get("lang") ?? "fr";
  const categoryId = url.searchParams.get("categoryId");
  const authorId = url.searchParams.get("authorId");
  const status = url.searchParams.get("status") ?? "published";

  const conditions: ReturnType<typeof eq>[] = [];

  // Default to published for public, admin can view all
  if (status === "published") {
    conditions.push(eq(article.status, "published"));
  }

  if (authorId) {
    conditions.push(eq(article.authorId, authorId));
  }

  const query = conditions.length > 0
    ? db.select().from(article).where(and(...conditions))
    : db.select().from(article);

  const rows = await query.orderBy(desc(article.createdAt)).limit(limit).offset(offset);

  // Filter by category if provided
  let filteredIds: string[] | null = null;
  if (categoryId) {
    const links = await db
      .select({ articleId: articleCategoryLink.articleId })
      .from(articleCategoryLink)
      .where(eq(articleCategoryLink.categoryId, categoryId));
    filteredIds = links.map((l) => l.articleId);
  }

  let filtered = rows;
  if (filteredIds !== null) {
    filtered = rows.filter((a) => filteredIds!.includes(a.id));
  }

  // Get content in requested language for each article
  const articleIds = filtered.map((a) => a.id);
  let contents: typeof articleContent.$inferSelect[] = [];
  if (articleIds.length > 0) {
    contents = await db
      .select()
      .from(articleContent)
      .where(
        and(
          sql`${articleContent.articleId} IN (${sql.join(articleIds.map((id) => sql`${id}`), sql`, `)})`,
          eq(articleContent.language, lang),
        ),
      );
  }

  const contentByArticle = new Map<string, typeof articleContent.$inferSelect>();
  for (const c of contents) {
    contentByArticle.set(c.articleId, c);
  }

  const enriched = filtered.map((a) => ({
    ...a,
    content: contentByArticle.get(a.id) ?? null,
  }));

  const countResult = await db
    .select({ total: sql<number>`count(*)` })
    .from(article)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return new Response(
    JSON.stringify({
      articles: enriched,
      total: Number(countResult[0]?.total ?? 0),
      limit,
      offset,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Create a new article (author role required). */
export const POST: APIRoute = async ({ request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const roles = await getUserRoles(session.user.id);
  if (!hasPermission(roles, "article.create")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.title || !body.slug || !body.contentJson) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "title, slug, and contentJson are required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Validate slug format
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
    return new Response(
      JSON.stringify({ error: "VAL_FORMAT", message: "slug must be lowercase alphanumeric with hyphens" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  // Check slug uniqueness
  const existing = await db
    .select({ id: article.id })
    .from(article)
    .where(eq(article.slug, body.slug))
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "BIZ_DUPLICATE", message: "SLUG_TAKEN" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const articleId = randomUUID();
  const lang = body.language ?? "fr";

  await db.insert(article).values({
    id: articleId,
    authorId: session.user.id,
    title: body.title,
    slug: body.slug,
    summary: body.summary ?? null,
    status: "draft",
    coverImageUrl: body.coverImageUrl ?? null,
  });

  // Create article content
  await db.insert(articleContent).values({
    id: randomUUID(),
    articleId,
    language: lang,
    title: body.title,
    summary: body.summary ?? null,
    contentJson: body.contentJson,
  });

  // Link categories if provided
  if (body.categoryIds && Array.isArray(body.categoryIds)) {
    for (const catId of body.categoryIds) {
      await db.insert(articleCategoryLink).values({
        articleId,
        categoryId: catId,
      });
    }
  }

  return new Response(
    JSON.stringify({ id: articleId, slug: body.slug, status: "draft" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
