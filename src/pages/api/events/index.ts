import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { event } from "@database/schemas";
import { eq, and, sql, gte } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** List events with filters. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const categoryId = url.searchParams.get("categoryId");
  const placeId = url.searchParams.get("placeId");
  const upcoming = url.searchParams.get("upcoming") === "true";

  const conditions: ReturnType<typeof eq>[] = [];

  if (categoryId) {
    conditions.push(eq(event.categoryId, categoryId));
  }
  if (placeId) {
    conditions.push(eq(event.placeId, placeId));
  }

  const rows = await db
    .select()
    .from(event)
    .where(
      and(
        ...conditions,
        upcoming ? gte(event.startAt, new Date()) : undefined,
      ),
    )
    .orderBy(event.startAt)
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ total: sql<number>`count(*)` })
    .from(event)
    .where(
      and(
        ...conditions,
        upcoming ? gte(event.startAt, new Date()) : undefined,
      ),
    );

  return new Response(
    JSON.stringify({
      events: rows,
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

/** Create a new event. */
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
  if (!hasPermission(roles, "event.create")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.title || !body.slug || !body.startAt) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "title, slug, and startAt required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  // Check slug uniqueness
  const existing = await db
    .select({ id: event.id })
    .from(event)
    .where(eq(event.slug, body.slug))
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "BIZ_DUPLICATE", message: "SLUG_TAKEN" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const eventId = randomUUID();

  await db.insert(event).values({
    id: eventId,
    createdBy: session.user.id,
    placeId: body.placeId ?? null,
    categoryId: body.categoryId ?? null,
    title: body.title,
    slug: body.slug,
    description: body.description ?? null,
    type: body.type ?? "culture",
    startAt: new Date(body.startAt),
    endAt: body.endAt ? new Date(body.endAt) : null,
    maxParticipants: body.maxParticipants ?? null,
    price: body.price?.toString() ?? null,
    isPaid: body.isPaid ?? false,
  });

  return new Response(
    JSON.stringify({ id: eventId, slug: body.slug }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
