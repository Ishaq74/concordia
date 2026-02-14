import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { category, categoryTranslation } from "@database/schemas";
import { eq, and, isNull } from "drizzle-orm";

export const prerender = false;

/** List categories with translations for given locale and optional type filter. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const lang = url.searchParams.get("lang") ?? "fr";
  const type = url.searchParams.get("type");
  const parentId = url.searchParams.get("parentId");

  const conditions = [eq(category.isActive, true)];
  if (type) {
    const { categoryTypeEnum } = await import("@database/schemas");
    conditions.push(eq(category.type, type as (typeof categoryTypeEnum.enumValues)[number]));
  }
  if (parentId === "null" || parentId === "") {
    conditions.push(isNull(category.parentId));
  } else if (parentId) {
    conditions.push(eq(category.parentId, parentId));
  }

  const { asc } = await import("drizzle-orm");
  const rows = await db
    .select({
      id: category.id,
      parentId: category.parentId,
      slug: category.slug,
      type: category.type,
      icon: category.icon,
      level: category.level,
      sortOrder: category.sortOrder,
      name: categoryTranslation.name,
      description: categoryTranslation.description,
    })
    .from(category)
    .leftJoin(
      categoryTranslation,
      and(
        eq(categoryTranslation.categoryId, category.id),
        eq(categoryTranslation.lang, lang),
      ),
    )
    .where(and(...conditions))
    .orderBy(asc(category.sortOrder), asc(category.slug));

  return new Response(JSON.stringify({ categories: rows }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
