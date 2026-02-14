import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import {
  volunteerProject,
} from "@database/schemas";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export const prerender = false;

/** List active volunteer projects. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const rows = await db
    .select()
    .from(volunteerProject)
    .where(eq(volunteerProject.status, "recruiting"))
    .orderBy(desc(volunteerProject.createdAt))
    .limit(limit)
    .offset(offset);

  return new Response(
    JSON.stringify({ projects: rows, limit, offset }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Create a volunteer project. */
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

  if (!body.title || !body.slug || !body.description) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "title, slug, description required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  const existing = await db
    .select({ id: volunteerProject.id })
    .from(volunteerProject)
    .where(eq(volunteerProject.slug, body.slug))
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "BIZ_DUPLICATE", message: "SLUG_TAKEN" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const id = randomUUID();

  await db.insert(volunteerProject).values({
    id,
    coordinatorId: session.user.id,
    title: body.title,
    slug: body.slug,
    description: body.description,
    startDate: body.startDate ?? null,
    endDate: body.endDate ?? null,
    volunteerGoal: body.volunteerGoal ?? null,
    status: "draft",
  });

  return new Response(
    JSON.stringify({ id, slug: body.slug, status: "draft" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
