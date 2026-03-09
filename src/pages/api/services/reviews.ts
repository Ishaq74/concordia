export const prerender = false;

import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { servicesReviews, servicesListings, servicesBookings } from "@database/schemas";
import { eq, and, desc } from "drizzle-orm";

const jsonResp = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * GET /api/services/reviews?serviceId=xxx
 * Public: returns approved reviews for a service
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("serviceId")?.trim();
  if (!serviceId) return jsonResp(400, { error: "serviceId requis" });

  const db = await getDrizzle();

  const reviews = await db
    .select()
    .from(servicesReviews)
    .where(
      and(
        eq(servicesReviews.serviceId, serviceId),
        eq(servicesReviews.status, "approved"),
      ),
    )
    .orderBy(desc(servicesReviews.createdAt));

  // Calculate stats
  const topLevel = reviews.filter((r) => !r.parentId);
  const avgRating =
    topLevel.length > 0
      ? Math.round(
          (topLevel.reduce((sum, r) => sum + r.rating, 0) / topLevel.length) * 10,
        ) / 10
      : null;

  return jsonResp(200, {
    reviews,
    stats: {
      count: topLevel.length,
      avgRating,
    },
  });
};

/**
 * POST /api/services/reviews — Submit a review (auth required)
 * Only customers who completed a booking can leave a review.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const session = (locals as any).session;
  const userId = session?.user?.id ?? (locals as any).user?.id;
  if (!userId) {
    return jsonResp(401, { error: "Authentification requise" });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonResp(400, { error: "JSON invalide" });
  }

  const serviceId = String(body.serviceId ?? "").trim();
  const rating = Number(body.rating);
  const content = String(body.content ?? "").trim();
  const inLanguage = String(body.inLanguage ?? "fr").trim();

  if (!serviceId || !content) {
    return jsonResp(400, { error: "serviceId et content sont requis" });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return jsonResp(400, { error: "rating doit être entre 1 et 5" });
  }

  const db = await getDrizzle();

  // Verify service exists and allows reviews
  const [service] = await db
    .select()
    .from(servicesListings)
    .where(eq(servicesListings.id, serviceId))
    .limit(1);

  if (!service) return jsonResp(404, { error: "Service introuvable" });
  if (!service.allowReviews) {
    return jsonResp(400, { error: "Les avis ne sont pas autorisés pour ce service" });
  }

  // Prevent reviewing own service
  if (service.providerId === userId) {
    return jsonResp(400, { error: "Vous ne pouvez pas laisser un avis sur votre propre service" });
  }

  // Verify the user has a completed booking for this service
  const [completedBooking] = await db
    .select({ id: servicesBookings.id })
    .from(servicesBookings)
    .where(
      and(
        eq(servicesBookings.serviceId, serviceId),
        eq(servicesBookings.customerId, userId),
        eq(servicesBookings.status, "completed"),
      ),
    )
    .limit(1);

  if (!completedBooking) {
    return jsonResp(403, {
      error: "Vous devez avoir complété une réservation pour laisser un avis",
    });
  }

  // Check for existing review by this user on this service
  const [existingReview] = await db
    .select({ id: servicesReviews.id })
    .from(servicesReviews)
    .where(
      and(
        eq(servicesReviews.serviceId, serviceId),
        eq(servicesReviews.authorId, userId),
      ),
    )
    .limit(1);

  if (existingReview) {
    return jsonResp(409, { error: "Vous avez déjà laissé un avis pour ce service" });
  }

  // Get user info for authorName/authorEmail
  const { user } = await import("@database/schemas/auth-schema");
  const [author] = await db
    .select({ name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, userId));

  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(servicesReviews).values({
    id,
    serviceId,
    authorName: author?.name ?? "Anonyme",
    authorEmail: author?.email ?? "",
    authorId: userId,
    content: { [inLanguage]: content },
    rating,
    status: "pending", // Requires moderation
    inLanguage,
    createdAt: now,
    updatedAt: now,
  });

  return jsonResp(201, { success: true, reviewId: id, status: "pending" });
};
