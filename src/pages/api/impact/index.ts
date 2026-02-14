import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { impactMetric, transparencyReport } from "@database/schemas";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** Get latest impact metrics and transparency reports. */
export const GET: APIRoute = async () => {
  const db = await getDrizzle();

  const metrics = await db
    .select()
    .from(impactMetric)
    .orderBy(desc(impactMetric.computedAt))
    .limit(50);

  const reports = await db
    .select()
    .from(transparencyReport)
    .where(eq(transparencyReport.status, "published"))
    .orderBy(desc(transparencyReport.publishedAt))
    .limit(10);

  return new Response(
    JSON.stringify({ metrics, reports }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Record an impact metric (admin only). */
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
  if (!hasPermission(roles, "admin_access")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.type || body.value === undefined || !body.periodStart || !body.periodEnd) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "type, value, periodStart, periodEnd required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();
  const id = randomUUID();

  await db.insert(impactMetric).values({
    id,
    type: body.type,
    value: body.value.toString(),
    periodStart: body.periodStart,
    periodEnd: body.periodEnd,
    scope: body.scope ?? "global",
    metadata: body.metadata ?? null,
  });

  return new Response(
    JSON.stringify({ id }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
