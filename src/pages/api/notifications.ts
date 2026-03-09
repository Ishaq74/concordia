// src/pages/api/notifications.ts — Notification CRUD API
import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { notification } from "@database/schemas/notification.schema";
import { eq, and, desc, count } from "drizzle-orm";

async function getSessionUserId(request: Request): Promise<string | null> {
  try {
    const { getAuth } = await import("@lib/auth/auth");
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ request, url }) => {
  const userId = await getSessionUserId(request);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const db = await getDrizzle();
  const type = url.searchParams.get("type") || "all";
  const unreadOnly = url.searchParams.get("unread") === "true";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  const conditions = [eq(notification.userId, userId)];
  if (type !== "all") conditions.push(eq(notification.type, type));
  if (unreadOnly) conditions.push(eq(notification.isRead, false));

  const [items, totalResult, unreadResult] = await Promise.all([
    db.select()
      .from(notification)
      .where(and(...conditions))
      .orderBy(desc(notification.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() })
      .from(notification)
      .where(and(...conditions)),
    db.select({ count: count() })
      .from(notification)
      .where(and(eq(notification.userId, userId), eq(notification.isRead, false))),
  ]);

  return new Response(JSON.stringify({
    notifications: items,
    total: totalResult[0]?.count ?? 0,
    unread: unreadResult[0]?.count ?? 0,
    page,
  }), { status: 200, headers: { "Content-Type": "application/json" } });
};

export const PATCH: APIRoute = async ({ request }) => {
  const userId = await getSessionUserId(request);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const db = await getDrizzle();
  const body = await request.json();
  const { action, notificationId } = body as { action: string; notificationId?: string };

  if (action === "markRead" && notificationId) {
    await db.update(notification)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notification.id, notificationId), eq(notification.userId, userId)));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (action === "markAllRead") {
    await db.update(notification)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notification.userId, userId), eq(notification.isRead, false)));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { "Content-Type": "application/json" } });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const userId = await getSessionUserId(request);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const notificationId = url.searchParams.get("id");
  if (!notificationId) {
    return new Response(JSON.stringify({ error: "Missing notification id" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const db = await getDrizzle();
  await db.delete(notification)
    .where(and(eq(notification.id, notificationId), eq(notification.userId, userId)));

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
};
