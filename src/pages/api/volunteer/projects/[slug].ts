import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import {
  volunteerProject,
  volunteerTask,
  volunteerParticipation,
} from "@database/schemas";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const prerender = false;

/** Get project detail with tasks. */
export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();

  const projects = await db
    .select()
    .from(volunteerProject)
    .where(eq(volunteerProject.slug, slug))
    .limit(1);

  if (projects.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const project = projects[0];

  const tasks = await db
    .select()
    .from(volunteerTask)
    .where(eq(volunteerTask.projectId, project.id));

  // Count participants via tasks
  const taskIds = tasks.map((t) => t.id);
  let participantCount = [{ count: 0 }];
  if (taskIds.length > 0) {
    participantCount = await db
      .select({ count: sql<number>`count(DISTINCT ${volunteerParticipation.userId})` })
      .from(volunteerParticipation)
      .where(
        and(
          sql`${volunteerParticipation.taskId} IN (${sql.join(taskIds.map((id) => sql`${id}`), sql`, `)})`,
          sql`${volunteerParticipation.status} NOT IN ('cancelled', 'no_show')`,
        ),
      );
  }

  return new Response(
    JSON.stringify({
      ...project,
      tasks,
      participantCount: Number(participantCount[0]?.count ?? 0),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Join a volunteer project by signing up to a task. */
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

  const body = await request.json();

  if (!body.taskId) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "taskId required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  const projects = await db
    .select()
    .from(volunteerProject)
    .where(eq(volunteerProject.slug, slug))
    .limit(1);

  if (projects.length === 0 || projects[0].status !== "recruiting") {
    return new Response(
      JSON.stringify({ error: "BIZ_NOT_FOUND", message: "Project not found or not recruiting" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const project = projects[0];

  // Verify task belongs to this project
  const tasks = await db
    .select()
    .from(volunteerTask)
    .where(
      and(
        eq(volunteerTask.id, body.taskId),
        eq(volunteerTask.projectId, project.id),
      ),
    )
    .limit(1);

  if (tasks.length === 0 || tasks[0].status !== "open") {
    return new Response(
      JSON.stringify({ error: "BIZ_NOT_FOUND", message: "Task not found or not open" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const task = tasks[0];

  // Check not already signed up for this task
  const existing = await db
    .select({ id: volunteerParticipation.id })
    .from(volunteerParticipation)
    .where(
      and(
        eq(volunteerParticipation.taskId, task.id),
        eq(volunteerParticipation.userId, session.user.id),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "BIZ_DUPLICATE", message: "Already signed up for this task" }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  // Check task capacity
  if (task.maxVolunteers !== null) {
    if (task.currentVolunteers >= task.maxVolunteers) {
      return new Response(
        JSON.stringify({ error: "BIZ_CAPACITY_FULL", message: "Task is at maximum volunteers" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const id = randomUUID();

  await db.insert(volunteerParticipation).values({
    id,
    taskId: task.id,
    userId: session.user.id,
    status: "signed_up",
  });

  // Increment current volunteers on task
  await db
    .update(volunteerTask)
    .set({ currentVolunteers: sql`${volunteerTask.currentVolunteers} + 1` })
    .where(eq(volunteerTask.id, task.id));

  // Increment volunteer count on project
  await db
    .update(volunteerProject)
    .set({ volunteerCount: sql`${volunteerProject.volunteerCount} + 1` })
    .where(eq(volunteerProject.id, project.id));

  return new Response(
    JSON.stringify({ id, status: "signed_up" }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
