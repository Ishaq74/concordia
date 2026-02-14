import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { localService, serviceAvailability } from "@database/schemas";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** List local services with filters. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const placeId = url.searchParams.get("placeId");

  const conditions: ReturnType<typeof eq>[] = [
    eq(localService.status, "active"),
  ];

  if (placeId) {
    conditions.push(eq(localService.placeId, placeId));
  }

  const rows = await db
    .select()
    .from(localService)
    .where(and(...conditions))
    .orderBy(desc(localService.createdAt))
    .limit(limit)
    .offset(offset);

  return new Response(
    JSON.stringify({ services: rows, limit, offset }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Create a local service. */
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
  if (!hasPermission(roles, "service.create")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.placeId || !body.title || !body.description) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "placeId, title, description required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  const id = randomUUID();

  await db.insert(localService).values({
    id,
    providerId: session.user.id,
    placeId: body.placeId,
    categoryId: body.categoryId ?? null,
    title: body.title,
    description: body.description,
    basePrice: body.basePrice?.toString() ?? null,
    priceType: body.priceType ?? null,
    durationMinutes: body.durationMinutes ?? null,
    isMobile: body.isMobile ?? false,
    maxParticipants: body.maxParticipants ?? null,
    bookingAdvanceHours: body.bookingAdvanceHours ?? null,
    cancellationHours: body.cancellationHours ?? null,
    status: "pending_review",
  });

  // Insert availability slots if provided
  if (body.availability && Array.isArray(body.availability)) {
    for (const slot of body.availability) {
      await db.insert(serviceAvailability).values({
        id: randomUUID(),
        serviceId: id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }
  }

  return new Response(
    JSON.stringify({ id, status: "pending_review" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
