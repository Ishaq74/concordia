import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { forumThread, forumPost } from "@database/schemas";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** Get a thread and its posts. */
export const GET: APIRoute = async ({ params, url }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "30", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const db = await getDrizzle();

  const threads = await db
    .select()
    .from(forumThread)
    .where(eq(forumThread.slug, slug))
    .limit(1);

  if (threads.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const thread = threads[0];

  const posts = await db
    .select()
    .from(forumPost)
    .where(eq(forumPost.threadId, thread.id))
    .orderBy(forumPost.createdAt)
    .limit(limit)
    .offset(offset);

  return new Response(
    JSON.stringify({ thread, posts, limit, offset }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Reply to a thread (create a new post). */
export const POST: APIRoute = async ({ params, request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const roles = await getUserRoles(session.user.id);
  if (!hasPermission(roles, "forum.create_post")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  if (!body.content || body.content.length < 2) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "content required (min 2 chars)" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  const threads = await db
    .select()
    .from(forumThread)
    .where(eq(forumThread.slug, slug))
    .limit(1);

  if (threads.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const thread = threads[0];

  if (thread.isLocked) {
    return new Response(
      JSON.stringify({ error: "BIZ_INVALID_STATE", message: "Thread is locked" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  if (thread.status !== "published") {
    return new Response(
      JSON.stringify({ error: "BIZ_INVALID_STATE", message: "Thread is not open" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const postId = randomUUID();

  await db.insert(forumPost).values({
    id: postId,
    threadId: thread.id,
    authorId: session.user.id,
    parentPostId: body.parentPostId ?? null,
    content: body.content,
    status: "published",
  });

  // Update thread post count and last activity
  await db
    .update(forumThread)
    .set({
      postCount: sql`${forumThread.postCount} + 1`,
      lastPostAt: new Date(),
    })
    .where(eq(forumThread.id, thread.id));

  return new Response(
    JSON.stringify({ id: postId }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
