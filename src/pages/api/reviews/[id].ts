import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { review, subRating, place } from "@database/schemas";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** Update a review — author only, within 15-minute temporal window. */
export const PATCH: APIRoute = async ({ params, request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const reviewId = params.id;
  if (!reviewId) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();
  const existing = await db
    .select()
    .from(review)
    .where(eq(review.id, reviewId))
    .limit(1);

  if (existing.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const r = existing[0];
  const roles = await getUserRoles(session.user.id);

  // ABAC check: owner within temporal window or admin
  const isAuthor = r.authorId === session.user.id;
  const isAdmin = hasPermission(roles, "admin_access");
  const createdAt = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
  const fifteenMinutes = 15 * 60 * 1000;
  const withinWindow = Date.now() - createdAt.getTime() < fifteenMinutes;

  if (!isAdmin) {
    if (!isAuthor) {
      return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!withinWindow) {
      return new Response(
        JSON.stringify({
          error: "BIZ_TEMPORAL_WINDOW_EXPIRED",
          message: "Reviews can only be edited within 15 minutes of creation",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if (r.status !== "published") {
    return new Response(
      JSON.stringify({ error: "BIZ_INVALID_STATE", message: "Cannot edit a non-published review" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) {
    if (body.content.length < 10 || body.content.length > 2000) {
      return new Response(
        JSON.stringify({ error: "VAL_TOO_LONG", message: "content must be 10-2000 chars" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    updates.content = body.content;
  }
  if (body.rating !== undefined && body.rating !== null && r.parentReviewId === null) {
    const rating = parseFloat(body.rating);
    if (isNaN(rating) || rating < 0.5 || rating > 5.0 || (rating * 2) % 1 !== 0) {
      return new Response(
        JSON.stringify({ error: "VAL_INVALID_ENUM", message: "rating must be 0.5-5.0 in 0.5 increments" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    updates.rating = rating.toString();
  }

  if (Object.keys(updates).length > 0) {
    await db.update(review).set(updates).where(eq(review.id, reviewId));
  }

  // Update sub-ratings if provided
  if (body.subRatings && Array.isArray(body.subRatings)) {
    // Delete old sub-ratings and reinsert
    await db.delete(subRating).where(eq(subRating.reviewId, reviewId));
    for (const sr of body.subRatings) {
      await db.insert(subRating).values({
        id: randomUUID(),
        reviewId,
        criterion: sr.criterion,
        score: sr.score.toString(),
      });
    }
  }

  // Recalculate place rating if rating changed
  if (updates.rating !== undefined && r.parentReviewId === null) {
    const ratingResult = await db
      .select({
        avg: sql<string>`COALESCE(AVG(${review.rating}::numeric), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(review)
      .where(
        and(
          eq(review.placeId, r.placeId),
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
      .where(eq(place.id, r.placeId));
  }

  return new Response(
    JSON.stringify({ success: true, id: reviewId }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/** Delete a review — admin or author. */
export const DELETE: APIRoute = async ({ params, request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const reviewId = params.id;
  if (!reviewId) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();
  const existing = await db.select().from(review).where(eq(review.id, reviewId)).limit(1);

  if (existing.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const r = existing[0];
  const roles = await getUserRoles(session.user.id);
  const isAuthor = r.authorId === session.user.id;
  const isAdmin = hasPermission(roles, "admin_access");

  if (!isAuthor && !isAdmin) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Soft delete by changing status to 'deleted'
  await db.update(review).set({ status: "deleted" }).where(eq(review.id, reviewId));

  // Recalculate place rating
  if (r.parentReviewId === null) {
    const ratingResult = await db
      .select({
        avg: sql<string>`COALESCE(AVG(${review.rating}::numeric), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(review)
      .where(
        and(
          eq(review.placeId, r.placeId),
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
      .where(eq(place.id, r.placeId));
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
