import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { review, subRating, place } from "@database/schemas";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";
import { createNotification } from "@lib/notifications/notifications";

export const prerender = false;

/** List reviews for a place. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const placeId = url.searchParams.get("placeId");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  if (!placeId) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "placeId required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const conditions = [
    eq(review.placeId, placeId),
    eq(review.status, "published"),
  ];

  const rows = await db
    .select()
    .from(review)
    .where(and(...conditions))
    .orderBy(desc(review.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch sub-ratings for each review
  const reviewIds = rows.map((r) => r.id);
  let subRatings: typeof subRating.$inferSelect[] = [];
  if (reviewIds.length > 0) {
    subRatings = await db
      .select()
      .from(subRating)
      .where(sql`${subRating.reviewId} IN (${sql.join(reviewIds.map(id => sql`${id}`), sql`, `)})`);
  }

  const subRatingsByReview = new Map<string, typeof subRating.$inferSelect[]>();
  for (const sr of subRatings) {
    const list = subRatingsByReview.get(sr.reviewId) ?? [];
    list.push(sr);
    subRatingsByReview.set(sr.reviewId, list);
  }

  const enriched = rows.map((r) => ({
    ...r,
    subRatings: subRatingsByReview.get(r.id) ?? [],
  }));

  return new Response(JSON.stringify({ reviews: enriched, limit, offset }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

/** Create a review. */
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
  if (!hasPermission(roles, "review.create")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.placeId || !body.content) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "placeId and content are required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Validate content length
  if (body.content.length < 10 || body.content.length > 2000) {
    return new Response(
      JSON.stringify({
        error: "VAL_TOO_LONG",
        message: "content must be 10-2000 chars",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Rating required for root reviews
  if (!body.parentReviewId && (body.rating === undefined || body.rating === null)) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "rating is required for root reviews",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Validate rating range
  if (body.rating !== undefined && body.rating !== null) {
    const r = parseFloat(body.rating);
    if (isNaN(r) || r < 0.5 || r > 5.0 || (r * 2) % 1 !== 0) {
      return new Response(
        JSON.stringify({
          error: "VAL_INVALID_ENUM",
          message: "rating must be 0.5 to 5.0 in 0.5 increments",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const db = await getDrizzle();

  // Check place exists and is published
  const placeRow = await db
    .select()
    .from(place)
    .where(eq(place.id, body.placeId))
    .limit(1);

  if (placeRow.length === 0 || placeRow[0].status !== "published") {
    return new Response(
      JSON.stringify({ error: "BIZ_NOT_FOUND", message: "Place not found or not published" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  // Check duplicate root review
  if (!body.parentReviewId) {
    const existing = await db
      .select({ id: review.id })
      .from(review)
      .where(
        and(
          eq(review.authorId, session.user.id),
          eq(review.placeId, body.placeId),
          sql`${review.parentReviewId} IS NULL`,
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "BIZ_DUPLICATE", message: "You already reviewed this place" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const reviewId = randomUUID();

  await db.insert(review).values({
    id: reviewId,
    placeId: body.placeId,
    authorId: session.user.id,
    parentReviewId: body.parentReviewId ?? null,
    title: body.title ?? null,
    content: body.content,
    rating: body.rating?.toString() ?? null,
    status: "published",
  });

  // Insert sub-ratings if provided
  if (body.subRatings && Array.isArray(body.subRatings)) {
    for (const sr of body.subRatings) {
      await db.insert(subRating).values({
        id: randomUUID(),
        reviewId,
        criterion: sr.criterion,
        score: sr.score.toString(),
      });
    }
  }

  // Recalculate place rating
  const ratingResult = await db
    .select({
      avg: sql<string>`COALESCE(AVG(${review.rating}::numeric), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(review)
    .where(
      and(
        eq(review.placeId, body.placeId),
        eq(review.status, "published"),
        sql`${review.parentReviewId} IS NULL`,
        sql`${review.rating} IS NOT NULL`,
      ),
    );

  const avg = parseFloat(ratingResult[0]?.avg ?? "0");
  const count = Number(ratingResult[0]?.count ?? 0);

  await db
    .update(place)
    .set({
      ratingAvg: (Math.round(avg * 10) / 10).toString(),
      ratingCount: count,
    })
    .where(eq(place.id, body.placeId));

  // Notify place owner
  const p = placeRow[0];
  if (p.ownerId !== session.user.id) {
    await createNotification({
      userId: p.ownerId,
      type: "review",
      title: "Nouvel avis",
      body: `Un nouvel avis a été publié sur votre lieu.`,
      targetType: "review",
      targetId: reviewId,
    });
  }

  return new Response(
    JSON.stringify({ id: reviewId, status: "published" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
