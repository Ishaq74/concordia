import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { group, groupMember } from "@database/schemas";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@lib/auth/auth";
import { checkPermission } from "@lib/auth/permissions";
import { getUserRoles } from "@lib/auth/roles";

export const prerender = false;

/**
 * GET /api/groups/[slug] — Group detail with members
 */
export const GET: APIRoute = async ({ params, locals }) => {
  const db = await getDrizzle();
  const { slug } = params;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = await db
    .select()
    .from(group)
    .where(eq(group.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const g = rows[0];

  // Private group: only members can see
  if (!g.isPublic) {
    const session = locals.user ? { user: locals.user } : null;
    if (!session) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const membership = await db
      .select()
      .from(groupMember)
      .where(
        and(
          eq(groupMember.groupId, g.id),
          eq(groupMember.userId, session.user.id),
        ),
      )
      .limit(1);

    if (membership.length === 0) {
      const roles = await getUserRoles(session.user.id);
      const isAdmin = await checkPermission(roles, "admin_access");
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  // Get members
  const members = await db
    .select()
    .from(groupMember)
    .where(eq(groupMember.groupId, g.id));

  const memberCount = members.length;

  return new Response(
    JSON.stringify({ ...g, members, memberCount }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * PATCH /api/groups/[slug] — Update group (by creator or admin)
 * Body: { name?, description?, isPublic? }
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

  const { slug } = params;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = await db
    .select()
    .from(group)
    .where(eq(group.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const g = rows[0];

  // Only creator or admin can update
  const roles = await getUserRoles(session.user.id);
  if (g.createdBy !== session.user.id && !(await checkPermission(roles, "group.delete_any"))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.isPublic !== undefined) updates.isPublic = body.isPublic;

  if (Object.keys(updates).length > 0) {
    await db.update(group).set(updates).where(eq(group.id, g.id));
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * POST /api/groups/[slug] — Join or leave group
 * Body: { action: "join" | "leave" }
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

  const { slug } = params;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const action = body.action;

  if (!action || !["join", "leave"].includes(action)) {
    return new Response(
      JSON.stringify({ error: "action must be 'join' or 'leave'" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const rows = await db
    .select()
    .from(group)
    .where(eq(group.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const g = rows[0];

  if (action === "join") {
    // Check duplicate
    const existing = await db
      .select()
      .from(groupMember)
      .where(
        and(
          eq(groupMember.groupId, g.id),
          eq(groupMember.userId, session.user.id),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "Already a member" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    await db.insert(groupMember).values({
      groupId: g.id,
      userId: session.user.id,
      role: "member",
    });

    return new Response(
      JSON.stringify({ success: true, action: "joined" }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  }

  // Leave
  // Creator cannot leave their group
  if (g.createdBy === session.user.id) {
    return new Response(
      JSON.stringify({ error: "Creator cannot leave the group" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  await db
    .delete(groupMember)
    .where(
      and(
        eq(groupMember.groupId, g.id),
        eq(groupMember.userId, session.user.id),
      ),
    );

  return new Response(
    JSON.stringify({ success: true, action: "left" }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * DELETE /api/groups/[slug] — Delete group (creator or admin)
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

  const { slug } = params;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = await db
    .select()
    .from(group)
    .where(eq(group.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const g = rows[0];

  const roles = await getUserRoles(session.user.id);
  if (g.createdBy !== session.user.id && !(await checkPermission(roles, "group.delete_any"))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Cascade deletes members via FK
  await db.delete(group).where(eq(group.id, g.id));

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
