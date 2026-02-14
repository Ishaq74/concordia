import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { gallery, galleryItem } from "@database/schemas";
import { sql } from "drizzle-orm";
import { getAuth } from "@lib/auth/auth";
import { checkPermission } from "@lib/auth/permissions";
import { getUserRoles } from "@lib/auth/roles";
import { randomUUID } from "node:crypto";

export const prerender = false;

/**
 * GET /api/galleries — List galleries
 * Query: ?page=1&limit=20
 */
export const GET: APIRoute = async ({ request }) => {
  const db = await getDrizzle();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  const [galleries, countResult] = await Promise.all([
    db
      .select({
        id: gallery.id,
        title: gallery.title,
        description: gallery.description,
        createdBy: gallery.createdBy,
        createdAt: gallery.createdAt,
        itemCount: sql<number>`(SELECT count(*)::int FROM gallery_item WHERE gallery_id = ${gallery.id})`,
      })
      .from(gallery)
      .orderBy(gallery.createdAt)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(gallery),
  ]);

  return new Response(
    JSON.stringify({
      data: galleries,
      total: countResult[0].count,
      page,
      limit,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * POST /api/galleries — Create a gallery
 * Body: { title, description?, items?: Array<{ mediaUrl, mediaType?, caption?, sortOrder? }> }
 */
export const POST: APIRoute = async ({ request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const roles = await getUserRoles(session.user.id);
  const permitted = await checkPermission(roles, "gallery.create");
  if (!permitted) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  if (!body.title) {
    return new Response(
      JSON.stringify({ error: "title is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();
  const galleryId = randomUUID();

  await db.insert(gallery).values({
    id: galleryId,
    title: body.title,
    description: body.description ?? null,
    createdBy: session.user.id,
  });

  // Insert initial items if provided
  if (body.items && Array.isArray(body.items)) {
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      await db.insert(galleryItem).values({
        id: randomUUID(),
        galleryId,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType ?? "image",
        caption: item.caption ?? null,
        sortOrder: item.sortOrder ?? i,
        uploadedBy: session.user.id,
      });
    }
  }

  return new Response(
    JSON.stringify({ id: galleryId }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
