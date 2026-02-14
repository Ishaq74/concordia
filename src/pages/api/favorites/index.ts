import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { favorite } from "@database/schemas";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export const prerender = false;

/** Toggle a favorite (add or remove). */
export const POST: APIRoute = async ({ request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { targetType, targetId } = body;

  if (!targetType || !targetId) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "targetType and targetId are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const allowedTypes = ["place", "event", "trail", "article"];
  if (!allowedTypes.includes(targetType)) {
    return new Response(
      JSON.stringify({ error: "VAL_INVALID_ENUM", field: "targetType" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  // Check if already favorited
  const existing = await db
    .select({ id: favorite.id })
    .from(favorite)
    .where(
      and(
        eq(favorite.userId, session.user.id),
        eq(favorite.targetType, targetType),
        eq(favorite.targetId, targetId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove
    await db.delete(favorite).where(eq(favorite.id, existing[0].id));
    return new Response(
      JSON.stringify({ action: "removed", targetType, targetId }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Add
  await db.insert(favorite).values({
    id: randomUUID(),
    userId: session.user.id,
    targetType,
    targetId,
  });

  return new Response(
    JSON.stringify({ action: "added", targetType, targetId }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};

/** List user's favorites, optionally filtered by type. */
export const GET: APIRoute = async ({ request, url }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();
  const typeFilter = url.searchParams.get("type");

  const conditions = [eq(favorite.userId, session.user.id)];
  if (typeFilter) {
    conditions.push(eq(favorite.targetType, typeFilter));
  }

  const { desc } = await import("drizzle-orm");
  const rows = await db
    .select()
    .from(favorite)
    .where(and(...conditions))
    .orderBy(desc(favorite.createdAt));

  return new Response(JSON.stringify({ favorites: rows }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
