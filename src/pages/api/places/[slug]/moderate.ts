import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { place } from "@database/schemas";
import { eq } from "drizzle-orm";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";
import { createNotification } from "@lib/notifications/notifications";

export const prerender = false;

/** Admin approves or rejects a place. */
export const POST: APIRoute = async ({ params, request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const roles = await getUserRoles(session.user.id);
  if (!hasPermission(roles, "place.approve")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { action, reason } = body;

  if (!action || !["approve", "reject"].includes(action)) {
    return new Response(
      JSON.stringify({ error: "VAL_INVALID_ENUM", field: "action" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (action === "reject" && (!reason || reason.trim().length < 5)) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "Rejection requires a reason (min 5 chars)",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  const existing = await db
    .select()
    .from(place)
    .where(eq(place.slug, slug))
    .limit(1);

  if (existing.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const p = existing[0];

  if (p.status !== "pending_review") {
    return new Response(
      JSON.stringify({
        error: "BIZ_INVALID_STATE",
        message: `Cannot ${action} a place with status "${p.status}"`,
      }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const newStatus = action === "approve" ? "published" : "rejected";
  const updates: Record<string, unknown> = { status: newStatus };
  if (action === "approve") {
    updates.publishedAt = new Date();
  }

  await db.update(place).set(updates).where(eq(place.id, p.id));

  // Notify the owner
  const notificationType = action === "approve" ? "moderation" : "moderation";
  const title =
    action === "approve" ? "Lieu approuvé" : "Lieu rejeté";
  const notifBody =
    action === "approve"
      ? `Votre lieu "${p.slug}" a été publié.`
      : `Votre lieu "${p.slug}" a été rejeté. Raison : ${reason}`;

  await createNotification({
    userId: p.ownerId,
    type: notificationType,
    title,
    body: notifBody,
    targetType: "place",
    targetId: p.id,
  });

  return new Response(
    JSON.stringify({ success: true, id: p.id, status: newStatus }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
