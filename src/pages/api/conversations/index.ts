import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import {
  conversation,
  conversationParticipant,
  message,
} from "@database/schemas";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const prerender = false;

/** List conversations for the current user. */
export const GET: APIRoute = async ({ request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();

  // Get conversation IDs the user participates in
  const participations = await db
    .select({ conversationId: conversationParticipant.conversationId })
    .from(conversationParticipant)
    .where(eq(conversationParticipant.userId, session.user.id));

  const convIds = participations.map((p) => p.conversationId);

  if (convIds.length === 0) {
    return new Response(
      JSON.stringify({ conversations: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const convs = await db
    .select()
    .from(conversation)
    .where(
      sql`${conversation.id} IN (${sql.join(convIds.map((id) => sql`${id}`), sql`, `)})`,
    )
    .orderBy(desc(conversation.lastMessageAt));

  return new Response(JSON.stringify({ conversations: convs }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

/** Create a new direct conversation. */
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

  if (!body.participantId) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "participantId required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (body.participantId === session.user.id) {
    return new Response(
      JSON.stringify({ error: "BIZ_SELF_MESSAGE", message: "Cannot create conversation with yourself" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  // Check if direct conversation already exists between these two users
  const myConvs = await db
    .select({ conversationId: conversationParticipant.conversationId })
    .from(conversationParticipant)
    .where(eq(conversationParticipant.userId, session.user.id));

  const myConvIds = myConvs.map((c) => c.conversationId);

  if (myConvIds.length > 0) {
    const theirConvs = await db
      .select({ conversationId: conversationParticipant.conversationId })
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.userId, body.participantId),
          sql`${conversationParticipant.conversationId} IN (${sql.join(myConvIds.map((id) => sql`${id}`), sql`, `)})`,
        ),
      );

    // Check if any shared conversation is a direct one
    if (theirConvs.length > 0) {
      const sharedIds = theirConvs.map((c) => c.conversationId);
      const directConvs = await db
        .select()
        .from(conversation)
        .where(
          and(
            sql`${conversation.id} IN (${sql.join(sharedIds.map((id) => sql`${id}`), sql`, `)})`,
            eq(conversation.type, "direct"),
          ),
        )
        .limit(1);

      if (directConvs.length > 0) {
        return new Response(
          JSON.stringify({ id: directConvs[0].id, existing: true }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
    }
  }

  const convId = randomUUID();

  await db.insert(conversation).values({
    id: convId,
    type: body.type ?? "direct",
    subject: body.subject ?? null,
    lastMessageAt: new Date(),
  });

  // Add both participants
  await db.insert(conversationParticipant).values([
    { id: randomUUID(), conversationId: convId, userId: session.user.id },
    { id: randomUUID(), conversationId: convId, userId: body.participantId },
  ]);

  // Create initial message if provided
  if (body.message) {
    await db.insert(message).values({
      id: randomUUID(),
      conversationId: convId,
      senderId: session.user.id,
      content: body.message,
    });
  }

  return new Response(
    JSON.stringify({ id: convId }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
