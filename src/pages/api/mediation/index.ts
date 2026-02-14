import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { mediationCase } from "@database/schemas";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** List mediation cases (mediator sees assigned, admin sees all). */
export const GET: APIRoute = async ({ request, url }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const roles = await getUserRoles(session.user.id);
  const isAdmin = hasPermission(roles, "admin_access");
  const isMediator = hasPermission(roles, "mediation.conduct_session");

  if (!isAdmin && !isMediator) {
    // Citizen: see own cases (as complainant or respondent)
    const db = await getDrizzle();
    const rows = await db
      .select()
      .from(mediationCase)
      .where(
        sql`${mediationCase.reporterId} = ${session.user.id} OR ${mediationCase.reportedUserId} = ${session.user.id}`,
      )
      .orderBy(desc(mediationCase.openedAt));

    return new Response(JSON.stringify({ cases: rows }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const conditions: ReturnType<typeof eq>[] = [];
  if (!isAdmin) {
    // Mediator: only assigned cases
    conditions.push(eq(mediationCase.mediatorId, session.user.id));
  }

  const rows = conditions.length > 0
    ? await db.select().from(mediationCase).where(and(...conditions)).orderBy(desc(mediationCase.openedAt)).limit(limit).offset(offset)
    : await db.select().from(mediationCase).orderBy(desc(mediationCase.openedAt)).limit(limit).offset(offset);

  return new Response(
    JSON.stringify({ cases: rows, limit, offset }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Open a mediation case. */
export const POST: APIRoute = async ({ request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.reportedUserId || !body.title || !body.description) {
    return new Response(
      JSON.stringify({
        error: "VAL_REQUIRED_FIELD",
        message: "reportedUserId, title, description required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (body.reportedUserId === session.user.id) {
    return new Response(
      JSON.stringify({ error: "BIZ_SELF_MEDIATION", message: "Cannot mediate against yourself" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();
  const id = randomUUID();

  await db.insert(mediationCase).values({
    id,
    reporterId: session.user.id,
    reportedUserId: body.reportedUserId,
    relatedEntityType: body.relatedEntityType ?? null,
    relatedEntityId: body.relatedEntityId ?? null,
    title: body.title,
    description: body.description,
    status: "opened",
    priority: body.priority ?? "normal",
  });

  return new Response(
    JSON.stringify({ id, status: "opened" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
