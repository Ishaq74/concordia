import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import {
  blogComments,

} from "@database/schemas";
import { eq } from "drizzle-orm";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";
import { createNotification } from "@lib/notifications/notifications";

export const prerender = false;

const entityMap = {
  blogComments: { table: blogComments, statusField: "status", authorField: "authorId" },
} as const;

type EntityType = keyof typeof entityMap;

/** Moderate a piece of content (set status to 'moderated'). */
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
  if (!hasPermission(roles, "moderation.action")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { entityType, entityId, reason } = body;

  if (!entityType || !entityId || !reason) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "entityType, entityId, reason required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!Object.keys(entityMap).includes(entityType)) {
    return new Response(
      JSON.stringify({ error: "VAL_INVALID_ENUM", field: "entityType" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (reason.trim().length < 5) {
    return new Response(
      JSON.stringify({ error: "VAL_TOO_SHORT", message: "reason must be at least 5 chars" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const config = entityMap[entityType as EntityType];
  const db = await getDrizzle();

  // Fetch the entity
  const rows = await db
    .select()
    .from(config.table)
    .where(eq((config.table as any).id, entityId))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const entity = rows[0] as Record<string, unknown>;

  // Check not already moderated
  if (entity[config.statusField] === "moderated") {
    return new Response(
      JSON.stringify({ error: "BIZ_ALREADY_MODERATED" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Prevent self-moderation
  const authorId = entity[config.authorField] as string;
  if (authorId === session.user.id) {
    return new Response(
      JSON.stringify({ error: "BIZ_SELF_MODERATION" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  // Set status to moderated
  await db
    .update(config.table)
    .set({ status: "moderated" } as any)
    .where(eq((config.table as any).id, entityId));

  // Notify the author
  await createNotification({
    userId: authorId,
    type: "moderation",
    title: "Contenu modéré",
    body: `Votre contenu a été modéré. Raison : ${reason}`,
    targetType: entityType,
    targetId: entityId,
  });

  return new Response(
    JSON.stringify({ success: true, entityType, entityId, status: "moderated" }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
