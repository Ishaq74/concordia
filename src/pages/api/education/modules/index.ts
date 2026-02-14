import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import {
  educationModule,
} from "@database/schemas";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";

export const prerender = false;

/** List published education modules. */
export const GET: APIRoute = async ({ url }) => {
  const db = await getDrizzle();
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const difficulty = url.searchParams.get("difficulty");
  const categoryId = url.searchParams.get("categoryId");

  const conditions: ReturnType<typeof eq>[] = [
    eq(educationModule.status, "published"),
  ];

  if (difficulty) {
    conditions.push(eq(educationModule.difficulty, difficulty as any));
  }
  if (categoryId) {
    conditions.push(eq(educationModule.categoryId, categoryId));
  }

  const rows = await db
    .select()
    .from(educationModule)
    .where(and(...conditions))
    .orderBy(desc(educationModule.createdAt))
    .limit(limit)
    .offset(offset);

  return new Response(
    JSON.stringify({ modules: rows, limit, offset }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Create an education module (educator role). */
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
  if (!hasPermission(roles, "education.create_module")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  if (!body.title || !body.slug) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "title and slug required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  const existing = await db
    .select({ id: educationModule.id })
    .from(educationModule)
    .where(eq(educationModule.slug, body.slug))
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "BIZ_DUPLICATE", message: "SLUG_TAKEN" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const id = randomUUID();

  await db.insert(educationModule).values({
    id,
    educatorId: session.user.id,
    categoryId: body.categoryId ?? null,
    title: body.title,
    slug: body.slug,
    description: body.description ?? null,
    difficulty: body.difficulty ?? "beginner",
    estimatedDurationHours: body.estimatedDurationHours ?? null,
    status: "draft",
    coverImageUrl: body.coverImageUrl ?? null,
  });

  return new Response(
    JSON.stringify({ id, slug: body.slug, status: "draft" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
