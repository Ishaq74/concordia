import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { profile } from "@database/schemas";
import { user as userTable } from "@database/schemas/auth-schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export const prerender = false;

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
    .from(profile)
    .where(eq(profile.userId, session.user.id))
    .limit(1);

  if (rows.length === 0) {
    // Auto-create profile for authenticated users who don't have one yet
    const newProfile = await db
      .insert(profile)
      .values({
        id: randomUUID(),
        userId: session.user.id,
        fullName: session.user.name ?? null,
        preferredLanguage: "fr",
      })
      .returning();

    return new Response(JSON.stringify(newProfile[0]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  return new Response(JSON.stringify(rows[0]), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

export const PATCH: APIRoute = async ({ request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  // Whitelist editable fields
  const allowedFields = [
    "fullName",
    "bio",
    "avatarUrl",
    "location",
    "website",
    "preferredLanguage",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  // Validation
  if (updates.bio && typeof updates.bio === "string" && updates.bio.length > 500) {
    return new Response(
      JSON.stringify({ error: "VAL_TOO_LONG", field: "bio" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (
    updates.preferredLanguage &&
    !["fr", "en", "ar", "es"].includes(updates.preferredLanguage as string)
  ) {
    return new Response(
      JSON.stringify({
        error: "VAL_INVALID_ENUM",
        field: "preferredLanguage",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (
    updates.website &&
    typeof updates.website === "string" &&
    updates.website.length > 255
  ) {
    return new Response(
      JSON.stringify({ error: "VAL_TOO_LONG", field: "website" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (Object.keys(updates).length === 0) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "No fields to update" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();
  const result = await db
    .update(profile)
    .set(updates)
    .where(eq(profile.userId, session.user.id))
    .returning();

  if (result.length === 0) {
    // Profile doesn't exist yet — create it with the provided fields
    const created = await db
      .insert(profile)
      .values({
        id: randomUUID(),
        userId: session.user.id,
        fullName: session.user.name ?? null,
        preferredLanguage: "fr",
        ...updates,
      })
      .returning();

    // Sync fullName to auth user table for consistency
    if (typeof updates.fullName === "string") {
      await db.update(userTable).set({ name: updates.fullName }).where(eq(userTable.id, session.user.id));
    }

    return new Response(JSON.stringify(created[0]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // Sync fullName to auth user table for consistency
  if (typeof updates.fullName === "string") {
    await db.update(userTable).set({ name: updates.fullName }).where(eq(userTable.id, session.user.id));
  }

  return new Response(JSON.stringify(result[0]), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
