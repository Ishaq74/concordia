import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { transparencyReport } from "@database/schemas";
import { eq } from "drizzle-orm";
import { getAuth } from "@lib/auth/auth";
import { checkPermission } from "@lib/auth/permissions";
import { getUserRoles } from "@lib/auth/roles";

export const prerender = false;

/**
 * GET /api/transparency/[slug] — Report detail
 */
export const GET: APIRoute = async ({ params }) => {
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
    .from(transparencyReport)
    .where(eq(transparencyReport.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const report = rows[0];

  // Non-published reports only visible to admins
  if (report.status !== "published") {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify(report),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * PATCH /api/transparency/[slug] — Update report (admin only)
 * Body: { title?, contentJson?, periodStart?, periodEnd?, metricIds? }
 */
export const PATCH: APIRoute = async ({ params, request }) => {
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
    .from(transparencyReport)
    .where(eq(transparencyReport.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const report = rows[0];

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.contentJson !== undefined) updates.contentJson = body.contentJson;
  if (body.periodStart !== undefined) updates.periodStart = body.periodStart;
  if (body.periodEnd !== undefined) updates.periodEnd = body.periodEnd;
  if (body.metricIds !== undefined) updates.metricIds = body.metricIds;

  if (Object.keys(updates).length > 0) {
    await db
      .update(transparencyReport)
      .set(updates)
      .where(eq(transparencyReport.id, report.id));
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};

/**
 * POST /api/transparency/[slug] — Publish or unpublish report
 * Body: { action: "publish" | "unpublish" }
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

  const roles = await getUserRoles(session.user.id);
  if (!(await checkPermission(roles, "transparency.publish_report"))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
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
  if (!body.action || !["publish", "unpublish"].includes(body.action)) {
    return new Response(
      JSON.stringify({ error: "action must be 'publish' or 'unpublish'" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const rows = await db
    .select()
    .from(transparencyReport)
    .where(eq(transparencyReport.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const report = rows[0];

  if (body.action === "publish") {
    await db
      .update(transparencyReport)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(transparencyReport.id, report.id));
  } else {
    await db
      .update(transparencyReport)
      .set({ status: "draft", publishedAt: null })
      .where(eq(transparencyReport.id, report.id));
  }

  return new Response(
    JSON.stringify({ success: true, status: body.action === "publish" ? "published" : "draft" }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
