import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { educationModule, educationLesson, educationEnrollment } from "@database/schemas";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export const prerender = false;

/** Get module detail with lessons. */
export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();

  const modules = await db
    .select()
    .from(educationModule)
    .where(eq(educationModule.slug, slug))
    .limit(1);

  if (modules.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const mod = modules[0];

  const lessons = await db
    .select()
    .from(educationLesson)
    .where(eq(educationLesson.moduleId, mod.id))
    .orderBy(educationLesson.sortOrder);

  return new Response(
    JSON.stringify({ ...mod, lessons }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Enroll in a module. */
export const POST: APIRoute = async ({ params, request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
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

  const db = await getDrizzle();

  const modules = await db
    .select()
    .from(educationModule)
    .where(eq(educationModule.slug, slug))
    .limit(1);

  if (modules.length === 0 || modules[0].status !== "published") {
    return new Response(
      JSON.stringify({ error: "BIZ_NOT_FOUND", message: "Module not found or not published" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const mod = modules[0];

  // Check not already enrolled
  const existing = await db
    .select({ id: educationEnrollment.id })
    .from(educationEnrollment)
    .where(
      and(
        eq(educationEnrollment.moduleId, mod.id),
        eq(educationEnrollment.userId, session.user.id),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "BIZ_DUPLICATE", message: "Already enrolled" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const id = randomUUID();

  await db.insert(educationEnrollment).values({
    id,
    moduleId: mod.id,
    userId: session.user.id,
    status: "active",
    progressPercent: "0",
  });

  return new Response(
    JSON.stringify({ id, status: "active" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
