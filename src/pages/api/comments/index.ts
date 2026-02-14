import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { comment } from "@database/schemas";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** List comments for a target (article, place, event, etc.). */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const targetType = url.searchParams.get("targetType");
  const targetId = url.searchParams.get("targetId");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "30", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  if (!targetType || !targetId) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "targetType and targetId required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const validTypes = ["article", "place", "trail", "event", "product"] as const;
  if (!validTypes.includes(targetType as any)) {
    return new Response(
      JSON.stringify({ error: "VAL_INVALID_ENUM", field: "targetType" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Build FK condition based on target type
  const targetFkCondition =
    targetType === "article" ? eq(comment.articleId, targetId) :
    targetType === "place" ? eq(comment.placeId, targetId) :
    targetType === "trail" ? eq(comment.trailId, targetId) :
    targetType === "event" ? eq(comment.eventId, targetId) :
    eq(comment.productId, targetId);

  // Fetch root-level published comments
  const rows = await db
    .select()
    .from(comment)
    .where(
      and(
        eq(comment.targetType, targetType as any),
        targetFkCondition,
        eq(comment.status, "published"),
        sql`${comment.parentCommentId} IS NULL`,
      ),
    )
    .orderBy(desc(comment.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch replies (depth 1-2) for root comments
  const rootIds = rows.map((r) => r.id);
  let replies: typeof comment.$inferSelect[] = [];
  if (rootIds.length > 0) {
    replies = await db
      .select()
      .from(comment)
      .where(
        and(
          sql`${comment.parentCommentId} IN (${sql.join(rootIds.map((id) => sql`${id}`), sql`, `)})`,
          eq(comment.status, "published"),
        ),
      )
      .orderBy(comment.createdAt);

    // Fetch depth-2 replies
    const depth1Ids = replies.map((r) => r.id);
    if (depth1Ids.length > 0) {
      const depth2 = await db
        .select()
        .from(comment)
        .where(
          and(
            sql`${comment.parentCommentId} IN (${sql.join(depth1Ids.map((id) => sql`${id}`), sql`, `)})`,
            eq(comment.status, "published"),
          ),
        )
        .orderBy(comment.createdAt);
      replies = replies.concat(depth2);
    }
  }

  // Build threaded structure
  const allComments = [...rows, ...replies];
  const byId = new Map(allComments.map((c) => [c.id, { ...c, children: [] as any[] }]));
  const roots: any[] = [];
  for (const c of allComments) {
    const node = byId.get(c.id)!;
    if (!c.parentCommentId) {
      roots.push(node);
    } else {
      const parent = byId.get(c.parentCommentId);
      if (parent) parent.children.push(node);
    }
  }

  return new Response(JSON.stringify({ comments: roots, limit, offset }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

/** Create a comment. */
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
  if (!hasPermission(roles, "comment.create")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.targetType || !body.targetId || !body.content) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "targetType, targetId, content required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (body.content.length < 2 || body.content.length > 2000) {
    return new Response(
      JSON.stringify({ error: "VAL_TOO_LONG", message: "content must be 2-2000 chars" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const validTypes = ["article", "place", "trail", "event", "product"] as const;
  if (!validTypes.includes(body.targetType as any)) {
    return new Response(
      JSON.stringify({ error: "VAL_INVALID_ENUM", field: "targetType" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  // If replying, check parent exists & enforce max depth of 3
  if (body.parentCommentId) {
    const parent = await db
      .select()
      .from(comment)
      .where(eq(comment.id, body.parentCommentId))
      .limit(1);

    if (parent.length === 0) {
      return new Response(
        JSON.stringify({ error: "BIZ_NOT_FOUND", message: "Parent comment not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // Check same target type and FK
    const parentFkValue =
      body.targetType === "article" ? parent[0].articleId :
      body.targetType === "place" ? parent[0].placeId :
      body.targetType === "trail" ? parent[0].trailId :
      body.targetType === "event" ? parent[0].eventId :
      parent[0].productId;

    if (parent[0].targetType !== body.targetType || parentFkValue !== body.targetId) {
      return new Response(
        JSON.stringify({ error: "BIZ_INVALID_STATE", message: "Reply must target same entity" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Check depth: if parent has a parent that also has a parent → depth 3 reached
    if (parent[0].parentCommentId) {
      const grandparent = await db
        .select({ parentCommentId: comment.parentCommentId })
        .from(comment)
        .where(eq(comment.id, parent[0].parentCommentId))
        .limit(1);

      if (grandparent.length > 0 && grandparent[0].parentCommentId !== null) {
        return new Response(
          JSON.stringify({ error: "BIZ_MAX_DEPTH", message: "Maximum comment depth (3) reached" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
    }
  }

  // Build FK data based on target type
  const fkData =
    body.targetType === "article" ? { articleId: body.targetId } :
    body.targetType === "place" ? { placeId: body.targetId } :
    body.targetType === "trail" ? { trailId: body.targetId } :
    body.targetType === "event" ? { eventId: body.targetId } :
    { productId: body.targetId };

  const commentId = randomUUID();
  await db.insert(comment).values({
    id: commentId,
    authorId: session.user.id,
    targetType: body.targetType,
    ...fkData,
    parentCommentId: body.parentCommentId ?? null,
    content: body.content,
    status: "published",
  });

  return new Response(
    JSON.stringify({ id: commentId, status: "published" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
