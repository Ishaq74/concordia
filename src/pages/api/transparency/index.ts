import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { transparencyReport } from "@database/schemas";
import { eq, desc, sql, count } from "drizzle-orm";
import { getAuth } from "@lib/auth/auth";
import { checkPermission } from "@lib/auth/permissions";
import { getUserRoles } from "@lib/auth/roles";
import { randomUUID } from "node:crypto";

export const prerender = false;

/**
 * GET /api/transparency — List published transparency reports
 * Query: ?page=1&limit=10
 */
export const GET: APIRoute = async ({ request }) => {
  const db = await getDrizzle();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10", 10)));
  const offset = (page - 1) * limit;

  const [reports, countResult] = await Promise.all([
    db
      .select()
      .from(transparencyReport)
      .where(eq(transparencyReport.status, "published"))
      .orderBy(desc(transparencyReport.publishedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(transparencyReport)
      .where(eq(transparencyReport.status, "published")),
  ]);

  return new Response(
    JSON.stringify({ data: reports, total: countResult[0].count, page, limit }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * POST /api/transparency — Create a transparency report (admin only)
 * Body: { title, slug, contentJson, periodStart, periodEnd, metricIds? }
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
  if (!(await checkPermission(roles, "transparency.publish_report"))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  if (!body.title || !body.slug || !body.contentJson || !body.periodStart || !body.periodEnd) {
    return new Response(
      JSON.stringify({ error: "title, slug, contentJson, periodStart, and periodEnd are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Check slug uniqueness
  const db = await getDrizzle();
  const existing = await db
    .select({ id: transparencyReport.id })
    .from(transparencyReport)
    .where(eq(transparencyReport.slug, body.slug))
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "Slug already exists" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const reportId = randomUUID();
  await db.insert(transparencyReport).values({
    id: reportId,
    title: body.title,
    slug: body.slug,
    contentJson: body.contentJson,
    periodStart: body.periodStart,
    periodEnd: body.periodEnd,
    metricIds: body.metricIds ?? null,
    publishedBy: session.user.id,
    status: "draft",
  });

  return new Response(
    JSON.stringify({ id: reportId, slug: body.slug, status: "draft" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
