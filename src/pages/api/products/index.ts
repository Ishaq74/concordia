import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { product } from "@database/schemas";
import { eq, ilike, and, sql } from "drizzle-orm";
import { getAuth } from "@lib/auth/auth";
import { checkPermission } from "@lib/auth/permissions";
import { getUserRoles } from "@lib/auth/roles";
import { randomUUID } from "node:crypto";

export const prerender = false;

/**
 * GET /api/products — List products
 * Query: ?search=&category=&local=true&page=1&limit=20
 */
export const GET: APIRoute = async ({ request }) => {
  const db = await getDrizzle();
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const category = url.searchParams.get("category");
  const localOnly = url.searchParams.get("local");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (search) {
    conditions.push(ilike(product.name, `%${search}%`));
  }
  if (category) {
    conditions.push(eq(product.category, category));
  }
  if (localOnly === "true") {
    conditions.push(eq(product.isLocal, true));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, countResult] = await Promise.all([
    db
      .select()
      .from(product)
      .where(where)
      .orderBy(product.createdAt)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(product)
      .where(where),
  ]);

  return new Response(
    JSON.stringify({
      data: products,
      total: countResult[0].count,
      page,
      limit,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * POST /api/products — Create a product
 * Body: { name, description?, category?, isLocal?, seasonStart?, seasonEnd? }
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
  const permitted = await checkPermission(roles, "product.create");
  if (!permitted) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  if (!body.name) {
    return new Response(
      JSON.stringify({ error: "name is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Validate season months if provided (1-12)
  if (body.seasonStart !== undefined && (body.seasonStart < 1 || body.seasonStart > 12)) {
    return new Response(
      JSON.stringify({ error: "seasonStart must be 1-12" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  if (body.seasonEnd !== undefined && (body.seasonEnd < 1 || body.seasonEnd > 12)) {
    return new Response(
      JSON.stringify({ error: "seasonEnd must be 1-12" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();
  const productId = randomUUID();
  await db.insert(product).values({
    id: productId,
    name: body.name,
    description: body.description ?? null,
    category: body.category ?? null,
    producerId: session.user.id,
    isLocal: body.isLocal !== false,
    seasonStart: body.seasonStart ?? null,
    seasonEnd: body.seasonEnd ?? null,
  });

  return new Response(
    JSON.stringify({ id: productId }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
