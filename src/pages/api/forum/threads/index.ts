import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { forumThread, forumPost } from "@database/schemas";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** List forum threads with pagination. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const categoryId = url.searchParams.get("categoryId");

  const conditions: ReturnType<typeof eq>[] = [
    eq(forumThread.status, "published"),
  ];

  if (categoryId) {
    conditions.push(eq(forumThread.categoryId, categoryId));
  }

  const rows = await db
    .select()
    .from(forumThread)
    .where(and(...conditions))
    .orderBy(desc(forumThread.lastPostAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ total: sql<number>`count(*)` })
    .from(forumThread)
    .where(and(...conditions));

  return new Response(
    JSON.stringify({
      threads: rows,
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

/** Create a new forum thread. */
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
  if (!hasPermission(roles, "forum.create_thread")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.categoryId || !body.title || !body.slug || !body.content) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "categoryId, title, slug, content required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
    return new Response(
      JSON.stringify({ error: "VAL_FORMAT", message: "slug must be lowercase alphanumeric with hyphens" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  // Check slug uniqueness within category
  const existing = await db
    .select({ id: forumThread.id })
    .from(forumThread)
    .where(and(eq(forumThread.categoryId, body.categoryId), eq(forumThread.slug, body.slug)))
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "BIZ_DUPLICATE", message: "SLUG_TAKEN" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const threadId = randomUUID();
  const postId = randomUUID();

  await db.insert(forumThread).values({
    id: threadId,
    categoryId: body.categoryId,
    authorId: session.user.id,
    title: body.title,
    slug: body.slug,
    isPinned: false,
    isLocked: false,
    status: "published",
    postCount: 1,
    lastPostAt: new Date(),
  });

  // Create the opening post
  await db.insert(forumPost).values({
    id: postId,
    threadId,
    authorId: session.user.id,
    content: body.content,
    status: "published",
  });

  return new Response(
    JSON.stringify({ id: threadId, slug: body.slug, postId }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
