import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { gallery, galleryItem } from "@database/schemas";
import { eq } from "drizzle-orm";
import { getAuth } from "@lib/auth/auth";
import { checkPermission } from "@lib/auth/permissions";
import { getUserRoles } from "@lib/auth/roles";
import { randomUUID } from "node:crypto";

export const prerender = false;

/**
 * GET /api/galleries/[id] — Gallery detail with items
 */
export const GET: APIRoute = async ({ params }) => {
  const db = await getDrizzle();
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = await db
    .select()
    .from(gallery)
    .where(eq(gallery.id, id))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const g = rows[0];

  const items = await db
    .select()
    .from(galleryItem)
    .where(eq(galleryItem.galleryId, id))
    .orderBy(galleryItem.sortOrder);

  return new Response(
    JSON.stringify({ ...g, items }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * PATCH /api/galleries/[id] — Update gallery metadata (owner or admin)
 * Body: { title?, description? }
 */
export const PATCH: APIRoute = async ({ params, request }) => {
  const db = await getDrizzle();
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = await db
    .select()
    .from(gallery)
    .where(eq(gallery.id, id))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const g = rows[0];

  const roles = await getUserRoles(session.user.id);
  if (g.createdBy !== session.user.id && !(await checkPermission(roles, "gallery.delete_any"))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;

  if (Object.keys(updates).length > 0) {
    await db.update(gallery).set(updates).where(eq(gallery.id, id));
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * POST /api/galleries/[id] — Add item to gallery
 * Body: { mediaUrl, mediaType?, caption?, sortOrder? }
 */
export const POST: APIRoute = async ({ params, request }) => {
  const db = await getDrizzle();
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = await db
    .select()
    .from(gallery)
    .where(eq(gallery.id, id))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const g = rows[0];

  // Only gallery creator or admin can add items
  const roles = await getUserRoles(session.user.id);
  if (g.createdBy !== session.user.id && !(await checkPermission(roles, "gallery.delete_any"))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  if (!body.mediaUrl) {
    return new Response(
      JSON.stringify({ error: "mediaUrl is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const itemId = randomUUID();
  await db.insert(galleryItem).values({
    id: itemId,
    galleryId: id,
    mediaUrl: body.mediaUrl,
    mediaType: body.mediaType ?? "image",
    caption: body.caption ?? null,
    sortOrder: body.sortOrder ?? 0,
    uploadedBy: session.user.id,
  });

  return new Response(
    JSON.stringify({ id: itemId }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * DELETE /api/galleries/[id] — Delete gallery (owner or admin)
 */
export const DELETE: APIRoute = async ({ params, request }) => {
  const db = await getDrizzle();
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = await db
    .select()
    .from(gallery)
    .where(eq(gallery.id, id))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const g = rows[0];

  const roles = await getUserRoles(session.user.id);
  if (g.createdBy !== session.user.id && !(await checkPermission(roles, "gallery.delete_any"))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Cascade deletes items via FK
  await db.delete(gallery).where(eq(gallery.id, id));

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
