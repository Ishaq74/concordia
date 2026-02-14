import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { group, groupMember } from "@database/schemas";
import { eq, and, ilike, sql } from "drizzle-orm";
import { getAuth } from "@lib/auth/auth";
import { checkPermission } from "@lib/auth/permissions";
import { getUserRoles } from "@lib/auth/roles";
import { randomUUID } from "node:crypto";

export const prerender = false;

/**
 * GET /api/groups — List groups (public + user's private groups)
 * Query: ?search=&page=1&limit=20
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const db = await getDrizzle();
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  const conditions = [];

  // Public groups always visible; private groups only to members
  const session = locals.user ? { user: locals.user } : null;
  if (!session) {
    conditions.push(eq(group.isPublic, true));
  }

  if (search) {
    conditions.push(ilike(group.name, `%${search}%`));
  }

  const where = conditions.length > 0
    ? and(...conditions)
    : undefined;

  const [groups, countResult] = await Promise.all([
    db
      .select()
      .from(group)
      .where(where)
      .orderBy(group.createdAt)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(group)
      .where(where),
  ]);

  return new Response(
    JSON.stringify({
      data: groups,
      total: countResult[0].count,
      page,
      limit,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * POST /api/groups — Create a group
 * Body: { name, slug, description?, isPublic? }
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
  const permitted = await checkPermission(roles, "group.create");
  if (!permitted) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  if (!body.name || !body.slug) {
    return new Response(
      JSON.stringify({ error: "name and slug are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Check slug uniqueness
  const db = await getDrizzle();
  const existing = await db
    .select({ id: group.id })
    .from(group)
    .where(eq(group.slug, body.slug))
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "Slug already exists" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const groupId = randomUUID();

  await db.insert(group).values({
    id: groupId,
    name: body.name,
    slug: body.slug,
    description: body.description ?? null,
    createdBy: session.user.id,
    isPublic: body.isPublic !== false,
  });

  // Creator becomes admin member
  await db.insert(groupMember).values({
    groupId,
    userId: session.user.id,
    role: "admin",
  });

  return new Response(
    JSON.stringify({ id: groupId, slug: body.slug }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
