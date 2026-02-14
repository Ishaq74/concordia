import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { booking, localService } from "@database/schemas";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** List bookings for current user. */
export const GET: APIRoute = async ({ request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();

  const rows = await db
    .select()
    .from(booking)
    .where(eq(booking.customerId, session.user.id))
    .orderBy(desc(booking.createdAt))
    .limit(50);

  return new Response(JSON.stringify({ bookings: rows }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

/** Create a booking. */
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
  if (!hasPermission(roles, "booking.create")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.serviceId || !body.bookingDate || !body.bookingTime) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "serviceId, bookingDate, bookingTime required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  // Check service exists and is active
  const service = await db
    .select()
    .from(localService)
    .where(eq(localService.id, body.serviceId))
    .limit(1);

  if (service.length === 0 || service[0].status !== "active") {
    return new Response(
      JSON.stringify({ error: "BIZ_NOT_FOUND", message: "Service not found or inactive" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  // Check no overlapping booking
  const existing = await db
    .select({ id: booking.id })
    .from(booking)
    .where(
      and(
        eq(booking.serviceId, body.serviceId),
        eq(booking.bookingDate, body.bookingDate),
        eq(booking.bookingTime, body.bookingTime),
        sql`${booking.status} NOT IN ('cancelled_by_client', 'cancelled_by_provider')`,
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "BIZ_SLOT_TAKEN", message: "Time slot already booked" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const id = randomUUID();

  await db.insert(booking).values({
    id,
    serviceId: body.serviceId,
    customerId: session.user.id,
    providerId: service[0].providerId,
    bookingDate: body.bookingDate,
    bookingTime: body.bookingTime,
    durationMinutes: body.durationMinutes ?? service[0].durationMinutes ?? 60,
    totalPrice: body.totalPrice?.toString() ?? service[0].basePrice ?? null,
    status: "pending",
    customerMessage: body.notes ?? null,
  });

  return new Response(
    JSON.stringify({ id, status: "pending" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
