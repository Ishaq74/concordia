import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import {
  place,
  placeTranslation,
  placeTag,
  placeAttributeValue,
} from "@database/schemas";
import { eq, and, ilike, sql, desc, asc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** List/search places with translated names. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const lang = url.searchParams.get("lang") ?? "fr";
  const status = url.searchParams.get("status") ?? "published";
  const categoryId = url.searchParams.get("categoryId");
  const ownerId = url.searchParams.get("ownerId");
  const search = url.searchParams.get("q");
  const sortBy = url.searchParams.get("sort") ?? "created_at";
  const order = url.searchParams.get("order") ?? "desc";
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const conditions: ReturnType<typeof eq>[] = [];
  if (status) conditions.push(eq(place.status, status as any));
  if (categoryId) conditions.push(eq(place.categoryId, categoryId));
  if (ownerId) conditions.push(eq(place.ownerId, ownerId));

  let query = db
    .select({
      id: place.id,
      slug: place.slug,
      type: place.type,
      latitude: place.latitude,
      longitude: place.longitude,
      priceRange: place.priceRange,
      ratingAvg: place.ratingAvg,
      ratingCount: place.ratingCount,
      status: place.status,
      createdAt: place.createdAt,
      name: placeTranslation.name,
      description: placeTranslation.description,
    })
    .from(place)
    .leftJoin(
      placeTranslation,
      and(
        eq(placeTranslation.placeId, place.id),
        eq(placeTranslation.language, lang),
      ),
    );

  if (search) {
    conditions.push(ilike(placeTranslation.name, `%${search}%`));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  const sortColumn =
    sortBy === "rating" ? place.ratingAvg :
    sortBy === "name" ? placeTranslation.name :
    place.createdAt;
  const orderFn = order === "asc" ? asc : desc;

  const rows = await query.orderBy(orderFn(sortColumn)).limit(limit).offset(offset);

  // Count total
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(place)
    .leftJoin(
      placeTranslation,
      and(
        eq(placeTranslation.placeId, place.id),
        eq(placeTranslation.language, lang),
      ),
    )
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = Number(countResult[0]?.count ?? 0);

  return new Response(
    JSON.stringify({ places: rows, total, limit, offset }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Create a new place. Requires owner role. */
export const POST: APIRoute = async ({ request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check permission
  const roles = await getUserRoles(session.user.id);
  if (!hasPermission(roles, "place.create")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  // Validate required fields
  if (!body.slug || !body.type || !body.categoryId) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "slug, type, and categoryId are required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!body.translations || !Array.isArray(body.translations) || body.translations.length === 0) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "At least one translation is required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();
  const placeId = randomUUID();

  try {
    // Insert place
    await db.insert(place).values({
      id: placeId,
      ownerId: session.user.id,
      categoryId: body.categoryId,
      slug: body.slug,
      type: body.type,
      addressId: body.addressId ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      website: body.website ?? null,
      openHours: body.openHours ?? null,
      accessibility: body.accessibility ?? null,
      audience: body.audience ?? null,
      priceRange: body.priceRange ?? null,
      status: "pending_review",
    });

    // Insert translations
    for (const t of body.translations) {
      await db.insert(placeTranslation).values({
        id: randomUUID(),
        placeId,
        language: t.language,
        name: t.name,
        description: t.description ?? null,
      });
    }

    // Insert tags if provided
    if (body.tagIds && Array.isArray(body.tagIds)) {
      for (const tagId of body.tagIds) {
        await db.insert(placeTag).values({ placeId, tagId });
      }
    }

    // Insert attribute values if provided
    if (body.attributes && Array.isArray(body.attributes)) {
      for (const attr of body.attributes) {
        await db.insert(placeAttributeValue).values({
          id: randomUUID(),
          placeId,
          attributeId: attr.attributeId,
          valueBoolean: attr.valueBoolean ?? null,
          valueString: attr.valueString ?? null,
          valueInteger: attr.valueInteger ?? null,
          valueDecimal: attr.valueDecimal ?? null,
        });
      }
    }

    return new Response(
      JSON.stringify({ id: placeId, slug: body.slug, status: "pending_review" }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("unique") || message.includes("duplicate")) {
      return new Response(
        JSON.stringify({ error: "BIZ_DUPLICATE", message: "Slug already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
    throw err;
  }
};
