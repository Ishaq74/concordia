import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { event, eventRegistration } from "@database/schemas";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const prerender = false;

/** Get event detail by slug. */
export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();
  const rows = await db.select().from(event).where(eq(event.slug, slug)).limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const e = rows[0];

  // Get registration count
  const regCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(eventRegistration)
    .where(
      and(
        eq(eventRegistration.eventId, e.id),
        eq(eventRegistration.status, "registered"),
      ),
    );

  return new Response(
    JSON.stringify({
      ...e,
      registrationCount: Number(regCount[0]?.count ?? 0),
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

/** Register for an event. */
export const POST: APIRoute = async ({ params, request }) => {
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
  const rows = await db.select().from(event).where(eq(event.slug, slug)).limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const e = rows[0];

  // Check not already registered
  const existing = await db
    .select({ id: eventRegistration.id })
    .from(eventRegistration)
    .where(
      and(
        eq(eventRegistration.eventId, e.id),
        eq(eventRegistration.userId, session.user.id),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "BIZ_DUPLICATE", message: "Already registered" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  // Check capacity
  if (e.maxParticipants !== null) {
    const confirmed = await db
      .select({ count: sql<number>`count(*)` })
      .from(eventRegistration)
      .where(
        and(
          eq(eventRegistration.eventId, e.id),
          eq(eventRegistration.status, "registered"),
        ),
      );

    if (Number(confirmed[0]?.count ?? 0) >= e.maxParticipants) {
      return new Response(
        JSON.stringify({ error: "BIZ_CAPACITY_FULL", message: "Event is at maximum capacity" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const regId = randomUUID();
  await db.insert(eventRegistration).values({
    id: regId,
    eventId: e.id,
    userId: session.user.id,
    status: "registered",
    paymentStatus: e.isPaid ? "pending" : undefined,
  });

  return new Response(
    JSON.stringify({ id: regId, status: "registered" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
