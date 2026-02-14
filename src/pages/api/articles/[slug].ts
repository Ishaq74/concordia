import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import {
  article,
  articleContent,
  articleCategoryLink,
  articlePlaceLink,
} from "@database/schemas";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** Get article by slug with content in requested language. */
export const GET: APIRoute = async ({ params, url }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const lang = url.searchParams.get("lang") ?? "fr";
  const db = await getDrizzle();

  const rows = await db
    .select()
    .from(article)
    .where(eq(article.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const a = rows[0];

  // Fetch content in preferred language, fallback to fr
  let content = await db
    .select()
    .from(articleContent)
    .where(and(eq(articleContent.articleId, a.id), eq(articleContent.language, lang)))
    .limit(1);

  if (content.length === 0 && lang !== "fr") {
    content = await db
      .select()
      .from(articleContent)
      .where(and(eq(articleContent.articleId, a.id), eq(articleContent.language, "fr")))
      .limit(1);
  }

  // Fetch all category links
  const categories = await db
    .select()
    .from(articleCategoryLink)
    .where(eq(articleCategoryLink.articleId, a.id));

  // Fetch all place links
  const places = await db
    .select()
    .from(articlePlaceLink)
    .where(eq(articlePlaceLink.articleId, a.id));

  return new Response(
    JSON.stringify({
      ...a,
      content: content[0] ?? null,
      categoryIds: categories.map((c) => c.categoryId),
      placeIds: places.map((p) => p.placeId),
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

/** Update an article — author (ownership) or admin. */
export const PATCH: APIRoute = async ({ params, request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();
  const rows = await db
    .select()
    .from(article)
    .where(eq(article.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const a = rows[0];
  const roles = await getUserRoles(session.user.id);
  const isAuthor = a.authorId === session.user.id;
  const isAdmin = hasPermission(roles, "admin_access");

  if (!isAuthor && !isAdmin) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (a.status === "rejected" && !isAdmin) {
    return new Response(
      JSON.stringify({ error: "BIZ_INVALID_STATE", message: "Rejected articles must be recreated" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const body = await request.json();
  const articleUpdates: Record<string, unknown> = {};

  if (body.coverImageUrl !== undefined) articleUpdates.coverImageUrl = body.coverImageUrl;

  if (Object.keys(articleUpdates).length > 0) {
    await db.update(article).set(articleUpdates).where(eq(article.id, a.id));
  }

  // Upsert content for specified language
  if (body.contentJson || body.title || body.summary) {
    const lang = body.language ?? "fr";
    const existingContent = await db
      .select()
      .from(articleContent)
      .where(and(eq(articleContent.articleId, a.id), eq(articleContent.language, lang)))
      .limit(1);

    if (existingContent.length > 0) {
      const contentUpdates: Record<string, unknown> = {};
      if (body.title !== undefined) contentUpdates.title = body.title;
      if (body.summary !== undefined) contentUpdates.summary = body.summary;
      if (body.contentJson !== undefined) contentUpdates.contentJson = body.contentJson;
      await db
        .update(articleContent)
        .set(contentUpdates)
        .where(eq(articleContent.id, existingContent[0].id));
    } else {
      await db.insert(articleContent).values({
        id: randomUUID(),
        articleId: a.id,
        language: lang,
        title: body.title ?? "",
        summary: body.summary ?? null,
        contentJson: body.contentJson ?? {},
      });
    }
  }

  return new Response(
    JSON.stringify({ success: true, id: a.id }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
