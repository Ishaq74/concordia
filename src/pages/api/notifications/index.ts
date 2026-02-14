import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@lib/notifications/notifications";

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const unreadOnly = url.searchParams.get("unread") === "true";

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(session.user.id, { limit, offset, unreadOnly }),
    getUnreadCount(session.user.id),
  ]);

  return new Response(
    JSON.stringify({ notifications, unreadCount, limit, offset }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
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
  const { action, notificationId } = body;

  if (action === "mark_read" && notificationId) {
    const success = await markNotificationRead(
      notificationId,
      session.user.id,
    );
    return new Response(JSON.stringify({ success }), {
      status: success ? 200 : 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "mark_all_read") {
    const count = await markAllNotificationsRead(session.user.id);
    return new Response(JSON.stringify({ success: true, count }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ error: "VAL_INVALID_ENUM", message: "Invalid action" }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    },
  );
};
