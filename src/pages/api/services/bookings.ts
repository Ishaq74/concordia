export const prerender = false;

import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { servicesBookings, servicesAvailability, servicesListings } from "@database/schemas";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/services/bookings — Create a public booking (auth required)
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Auth check
  const session = (locals as any).session;
  const userId = session?.user?.id ?? (locals as any).user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Authentification requise" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON invalide" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { serviceId, bookingDate, bookingTime, customerMessage } = body;

  if (!serviceId || !bookingDate || !bookingTime) {
    return new Response(
      JSON.stringify({ error: "serviceId, bookingDate et bookingTime sont requis" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  // Fetch service to get providerId, durationMinutes, basePrice, currency
  const [service] = await db
    .select()
    .from(servicesListings)
    .where(eq(servicesListings.id, serviceId))
    .limit(1);

  if (!service) {
    return new Response(JSON.stringify({ error: "Service introuvable" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (service.status !== "active") {
    return new Response(JSON.stringify({ error: "Ce service n'est pas disponible" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check availability — convert bookingDate (YYYY-MM-DD) to day of week (0-6)
  const dayOfWeek = new Date(bookingDate).getDay();
  const slots = await db
    .select()
    .from(servicesAvailability)
    .where(
      and(
        eq(servicesAvailability.serviceId, serviceId),
        eq(servicesAvailability.dayOfWeek, dayOfWeek),
        eq(servicesAvailability.isAvailable, true),
      ),
    );

  if (slots.length > 0) {
    // Check if bookingTime falls within any available slot
    const timeInRange = slots.some((slot) => {
      return bookingTime >= slot.startTime && bookingTime <= slot.endTime;
    });
    if (!timeInRange) {
      return new Response(
        JSON.stringify({ error: "Créneau non disponible pour ce jour" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }
  // If no slots defined, allow booking (no availability restrictions configured)

  // Prevent booking own service
  if (service.providerId === userId) {
    return new Response(
      JSON.stringify({ error: "Vous ne pouvez pas réserver votre propre service" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(servicesBookings).values({
    id,
    serviceId,
    customerId: userId,
    providerId: service.providerId,
    bookingDate,
    bookingTime,
    durationMinutes: service.durationMinutes ?? 60,
    totalPrice: service.basePrice,
    currency: service.currency ?? "EUR",
    status: "pending",
    customerMessage: customerMessage?.trim() || null,
    createdAt: now,
    updatedAt: now,
  });

  return new Response(
    JSON.stringify({ success: true, bookingId: id }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
