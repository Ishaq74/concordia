import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { userRole } from "@database/schemas";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";
import { createNotification } from "@lib/notifications/notifications";

export const prerender = false;

/** Assign or revoke a role. */
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
  if (!hasPermission(roles, "change_role")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { action, userId, role } = body;

  if (!action || !userId || !role) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "action, userId, role required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!["assign", "revoke"].includes(action)) {
    return new Response(
      JSON.stringify({ error: "VAL_INVALID_ENUM", field: "action" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const validRoles = [
    "citizen",
    "owner",
    "author",
    "mediator",
    "educator",
    "moderator",
    "admin",
  ];
  if (!validRoles.includes(role)) {
    return new Response(
      JSON.stringify({ error: "VAL_INVALID_ENUM", field: "role" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Prevent self-assignment
  if (userId === session.user.id) {
    return new Response(
      JSON.stringify({ error: "BIZ_SELF_ROLE_CHANGE" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  if (action === "assign") {
    // Check not already assigned
    const existing = await db
      .select({ id: userRole.id })
      .from(userRole)
      .where(and(eq(userRole.userId, userId), eq(userRole.role, role as any)))
      .limit(1);

    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "BIZ_ROLE_ALREADY_ASSIGNED" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    await db.insert(userRole).values({
      id: randomUUID(),
      userId,
      role: role as any,
    });

    await createNotification({
      userId,
      type: "system",
      title: "Rôle attribué",
      body: `Le rôle "${role}" vous a été attribué.`,
      targetType: "user",
      targetId: userId,
    });

    return new Response(
      JSON.stringify({ success: true, action: "assigned", role }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Revoke
  if (role === "citizen") {
    return new Response(
      JSON.stringify({ error: "BIZ_CANNOT_REVOKE_CITIZEN" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  await db
    .delete(userRole)
    .where(and(eq(userRole.userId, userId), eq(userRole.role, role as any)));

  await createNotification({
    userId,
    type: "system",
    title: "Rôle révoqué",
    body: `Le rôle "${role}" vous a été retiré.`,
    targetType: "user",
    targetId: userId,
  });

  return new Response(
    JSON.stringify({ success: true, action: "revoked", role }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
