import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { place, placeTranslation, placeAttributeValue, placeTag } from "@database/schemas";
import { eq, and } from "drizzle-orm";

export const prerender = false;

/** Get a place by slug with all translations, attributes, and tags. */
export const GET: APIRoute = async ({ params }) => {
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
    .from(place)
    .where(eq(place.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const p = rows[0];

  const [translations, attributes, tags] = await Promise.all([
    db
      .select()
      .from(placeTranslation)
      .where(eq(placeTranslation.placeId, p.id)),
    db
      .select()
      .from(placeAttributeValue)
      .where(eq(placeAttributeValue.placeId, p.id)),
    db
      .select()
      .from(placeTag)
      .where(eq(placeTag.placeId, p.id)),
  ]);

  return new Response(
    JSON.stringify({ ...p, translations, attributes, tags }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Update a place. Requires owner of the place or admin. */
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

  const existing = await db
    .select()
    .from(place)
    .where(eq(place.slug, slug))
    .limit(1);

  if (existing.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const p = existing[0];

  // Only owner or admin can update
  const { getUserRoles } = await import("@lib/auth/roles");
  const { hasPermission } = await import("@lib/auth/permissions");
  const roles = await getUserRoles(session.user.id);

  if (p.ownerId !== session.user.id && !hasPermission(roles, "place.update_any")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  const allowedFields = [
    "addressId",
    "latitude",
    "longitude",
    "email",
    "phone",
    "website",
    "openHours",
    "accessibility",
    "audience",
    "priceRange",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length > 0) {
    await db.update(place).set(updates).where(eq(place.id, p.id));
  }

  // Update translations if provided
  if (body.translations && Array.isArray(body.translations)) {
    for (const t of body.translations) {
      const existingTrans = await db
        .select()
        .from(placeTranslation)
        .where(
          and(
            eq(placeTranslation.placeId, p.id),
            eq(placeTranslation.language, t.language),
          ),
        )
        .limit(1);

      if (existingTrans.length > 0) {
        await db
          .update(placeTranslation)
          .set({ name: t.name, description: t.description ?? null })
          .where(eq(placeTranslation.id, existingTrans[0].id));
      } else {
        const { randomUUID } = await import("crypto");
        await db.insert(placeTranslation).values({
          id: randomUUID(),
          placeId: p.id,
          language: t.language,
          name: t.name,
          description: t.description ?? null,
        });
      }
    }
  }

  return new Response(JSON.stringify({ success: true, id: p.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
