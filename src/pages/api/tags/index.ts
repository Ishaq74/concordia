import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { tag, tagTranslation } from "@database/schemas";
import { eq, and, ilike } from "drizzle-orm";

export const prerender = false;

/** List/search tags with translations. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const lang = url.searchParams.get("lang") ?? "fr";
  const search = url.searchParams.get("q");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 200);

  const { asc } = await import("drizzle-orm");

  let query = db
    .select({
      id: tag.id,
      slug: tag.slug,
      name: tagTranslation.name,
    })
    .from(tag)
    .leftJoin(
      tagTranslation,
      and(eq(tagTranslation.tagId, tag.id), eq(tagTranslation.lang, lang)),
    );

  if (search) {
    query = query.where(ilike(tagTranslation.name, `%${search}%`)) as typeof query;
  }

  const rows = await query.orderBy(asc(tagTranslation.name)).limit(limit);

  return new Response(JSON.stringify({ tags: rows }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
