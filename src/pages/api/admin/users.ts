export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminUser } from "@lib/admin/permissions";
import {
  listUsers,
  setUserRole,
  banUser,
  unbanUser,
  listUserSessions,
  revokeUserSessions,
} from "@lib/admin/users";

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const guardAdmin = (locals: App.Locals) => {
  if (!isAdminUser(locals.user)) {
    return json(403, { error: "forbidden" });
  }
  return null;
};

const resolveErrorStatus = (error: unknown) => {
  if (typeof error === "object" && error && "status" in error) {
    const status = Number((error as { status?: number }).status);
    if (Number.isInteger(status) && status >= 100 && status <= 599) {
      return status;
    }
  }
  return 500;
};

const resolveErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error) {
    if ("message" in error && typeof (error as { message?: string }).message === "string") {
      return (error as { message?: string }).message ?? "unknown_error";
    }
    if ("body" in error) {
      const body = (error as { body?: { error?: string; message?: string } }).body;
      if (body?.error) return body.error;
      if (body?.message) return body.message;
    }
  }
  return "unknown_error";
};

export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());

  try {
    const listing = await listUsers(request.headers, query);
    return json(200, listing);
  } catch (error) {
    return json(resolveErrorStatus(error), { error: resolveErrorMessage(error) });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: "invalid_body" });
  }

  const action = String(payload.action ?? "").trim();
  if (!action) {
    return json(400, { error: "missing_action" });
  }

  const userId = payload.userId ? String(payload.userId).trim() : "";
  if (!userId) {
    return json(400, { error: "missing_userId" });
  }

  try {
    if (action === "set-role") {
      const role = String(payload.role ?? "").trim();
      if (!role) {
        return json(400, { error: "missing_role" });
      }
      await setUserRole(request.headers, { userId, role });
    } else if (action === "ban") {
      const reason = payload.reason ? String(payload.reason).trim() : undefined;
      await banUser(request.headers, { userId, reason });
    } else if (action === "unban") {
      await unbanUser(request.headers, { userId });
    } else if (action === "list-sessions") {
      const sessions = await listUserSessions(request.headers, { userId });
      return json(200, sessions);
    } else if (action === "revoke-sessions") {
      await revokeUserSessions(request.headers, { userId });
    } else {
      return json(400, { error: "unknown_action" });
    }

    return json(200, { ok: true });
  } catch (error) {
    return json(resolveErrorStatus(error), { error: resolveErrorMessage(error) });
  }
};
