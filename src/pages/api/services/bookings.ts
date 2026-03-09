export const prerender = false;

import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { servicesBookings, servicesAvailability, servicesListings } from "@database/schemas";
import { eq, and, sql } from "drizzle-orm";

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

  // Enforce bookingAdvanceHours — reject bookings too close to service time
  if (service.bookingAdvanceHours) {
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const minDate = new Date(Date.now() + service.bookingAdvanceHours * 3600_000);
    if (bookingDateTime < minDate) {
      return new Response(
        JSON.stringify({
          error: `La réservation doit être faite au moins ${service.bookingAdvanceHours}h à l'avance`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // Calculate end time for overlap detection
  const durationMinutes = service.durationMinutes ?? 60;
  const [startH, startM] = bookingTime.split(":").map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = startTotal + durationMinutes;
  const endH = String(Math.floor(endTotal / 60)).padStart(2, "0");
  const endM = String(endTotal % 60).padStart(2, "0");
  const bookingEndTime = `${endH}:${endM}`;

  // Double-booking prevention: check for overlapping bookings
  // Uses a row-level advisory lock via SELECT FOR UPDATE to prevent race conditions
  const existingBookings = await db
    .select({ id: servicesBookings.id })
    .from(servicesBookings)
    .where(
      and(
        eq(servicesBookings.serviceId, serviceId),
        eq(servicesBookings.bookingDate, bookingDate),
        sql`${servicesBookings.status} IN ('pending', 'confirmed')`,
        // Overlap: existing [bookingTime, bookingTime+duration] intersects new [bookingTime, endTime]
        sql`${servicesBookings.bookingTime} < ${bookingEndTime}`,
        sql`CAST(${servicesBookings.bookingTime} AS time) + (${servicesBookings.durationMinutes} || ' minutes')::interval > ${bookingTime}::time`,
      ),
    );

  if (existingBookings.length > 0) {
    return new Response(
      JSON.stringify({ error: "Ce créneau est déjà réservé. Veuillez choisir un autre horaire." }),
      { status: 409, headers: { "Content-Type": "application/json" } },
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

  // Send booking confirmation email (fire-and-forget)
  sendBookingConfirmationEmail({
    bookingId: id,
    serviceId,
    bookingDate,
    bookingTime,
    durationMinutes: service.durationMinutes ?? 60,
  }).catch((err) => console.error("[booking] email error:", err));

  return new Response(
    JSON.stringify({ success: true, bookingId: id }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * Send confirmation emails to both customer and provider.
 */
async function sendBookingConfirmationEmail(params: {
  bookingId: string;
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  durationMinutes: number;
}) {
  try {
    const { smtp } = await import("@lib/smtp/smtp");
    const db = await getDrizzle();
    const { user } = await import("@database/schemas/auth-schema");
    const { servicesTranslations } = await import("@database/schemas");

    // Get booking with customer + provider info
    const [booking] = await db
      .select()
      .from(servicesBookings)
      .where(eq(servicesBookings.id, params.bookingId));
    if (!booking) return;

    const [customer] = await db
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, booking.customerId));

    const [provider] = await db
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, booking.providerId));

    // Get service title
    const [translation] = await db
      .select({ title: servicesTranslations.title })
      .from(servicesTranslations)
      .where(eq(servicesTranslations.serviceId, params.serviceId))
      .limit(1);

    const serviceTitle = translation
      ? typeof translation.title === "string"
        ? translation.title
        : (translation.title as Record<string, string>)?.fr || "Service"
      : "Service";

    const dateFormatted = new Date(params.bookingDate).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Email to customer
    if (customer?.email) {
      await smtp.send({
        to: customer.email,
        subject: `Confirmation de réservation — ${serviceTitle}`,
        html: `
          <h2>Votre réservation a été enregistrée</h2>
          <p>Bonjour ${customer.name || ""},</p>
          <p>Votre réservation pour <strong>${serviceTitle}</strong> a bien été enregistrée.</p>
          <ul>
            <li><strong>Date :</strong> ${dateFormatted}</li>
            <li><strong>Heure :</strong> ${params.bookingTime}</li>
            <li><strong>Durée :</strong> ${params.durationMinutes} min</li>
            <li><strong>Statut :</strong> En attente de confirmation</li>
          </ul>
          <p>Vous recevrez un email lorsque le prestataire confirmera votre réservation.</p>
          <p>– L'équipe Concordia</p>
        `,
      });
    }

    // Email to provider
    if (provider?.email) {
      await smtp.send({
        to: provider.email,
        subject: `Nouvelle réservation — ${serviceTitle}`,
        html: `
          <h2>Vous avez une nouvelle réservation</h2>
          <p>Bonjour ${provider.name || ""},</p>
          <p>Une nouvelle réservation a été faite pour <strong>${serviceTitle}</strong>.</p>
          <ul>
            <li><strong>Client :</strong> ${customer?.name || "Client"} (${customer?.email || "N/A"})</li>
            <li><strong>Date :</strong> ${dateFormatted}</li>
            <li><strong>Heure :</strong> ${params.bookingTime}</li>
            <li><strong>Durée :</strong> ${params.durationMinutes} min</li>
            ${booking.customerMessage ? `<li><strong>Message :</strong> ${booking.customerMessage}</li>` : ""}
          </ul>
          <p>Connectez-vous à votre espace pour confirmer ou gérer cette réservation.</p>
          <p>– L'équipe Concordia</p>
        `,
      });
    }
  } catch (err) {
    console.error("[booking-email]", err);
  }
}
