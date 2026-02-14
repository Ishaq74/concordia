import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { product } from "@database/schemas";
import { eq } from "drizzle-orm";
import { getAuth } from "@lib/auth/auth";
import { checkPermission } from "@lib/auth/permissions";
import { getUserRoles } from "@lib/auth/roles";

export const prerender = false;

/**
 * GET /api/products/[id] — Product detail
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
    .from(product)
    .where(eq(product.id, id))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify(rows[0]),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * PATCH /api/products/[id] — Update product (producer or admin)
 * Body: { name?, description?, category?, isLocal?, seasonStart?, seasonEnd? }
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
    .from(product)
    .where(eq(product.id, id))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const p = rows[0];

  const roles = await getUserRoles(session.user.id);
  if (p.producerId !== session.user.id && !(await checkPermission(roles, "product.delete_any"))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.category !== undefined) updates.category = body.category;
  if (body.isLocal !== undefined) updates.isLocal = body.isLocal;

  if (body.seasonStart !== undefined) {
    if (body.seasonStart !== null && (body.seasonStart < 1 || body.seasonStart > 12)) {
      return new Response(
        JSON.stringify({ error: "seasonStart must be 1-12 or null" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    updates.seasonStart = body.seasonStart;
  }
  if (body.seasonEnd !== undefined) {
    if (body.seasonEnd !== null && (body.seasonEnd < 1 || body.seasonEnd > 12)) {
      return new Response(
        JSON.stringify({ error: "seasonEnd must be 1-12 or null" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    updates.seasonEnd = body.seasonEnd;
  }

  if (Object.keys(updates).length > 0) {
    await db.update(product).set(updates).where(eq(product.id, id));
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * DELETE /api/products/[id] — Delete product (producer or admin)
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
    .from(product)
    .where(eq(product.id, id))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const p = rows[0];

  const roles = await getUserRoles(session.user.id);
  if (p.producerId !== session.user.id && !(await checkPermission(roles, "product.delete_any"))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  await db.delete(product).where(eq(product.id, id));

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
