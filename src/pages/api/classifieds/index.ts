import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { classified } from "@database/schemas";
import { eq, and, desc, sql, ilike } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** List classifieds with filters. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const categoryId = url.searchParams.get("categoryId");
  const q = url.searchParams.get("q");
  const condition = url.searchParams.get("condition");

  const conditions: ReturnType<typeof eq>[] = [
    eq(classified.status, "active"),
  ];

  if (categoryId) {
    conditions.push(eq(classified.categoryId, categoryId));
  }
  if (condition) {
    conditions.push(eq(classified.condition, condition as any));
  }

  const baseWhere = and(
    ...conditions,
    q ? ilike(classified.title, `%${q}%`) : undefined,
  );

  const rows = await db
    .select()
    .from(classified)
    .where(baseWhere)
    .orderBy(desc(classified.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ total: sql<number>`count(*)` })
    .from(classified)
    .where(baseWhere);

  return new Response(
    JSON.stringify({
      classifieds: rows,
      total: Number(countResult[0]?.total ?? 0),
      limit,
      offset,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Create a classified ad. */
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
  if (!hasPermission(roles, "classified.create")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.title || !body.description) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "title, description required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();
  const id = randomUUID();

  await db.insert(classified).values({
    id,
    sellerId: session.user.id,
    categoryId: body.categoryId ?? null,
    title: body.title,
    description: body.description,
    price: body.price?.toString() ?? null,
    condition: body.condition ?? "used",
    location: body.location ?? null,
    status: "pending_review",
  });

  return new Response(
    JSON.stringify({ id, status: "pending_review" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
