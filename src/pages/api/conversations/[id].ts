import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { conversation, conversationParticipant, message } from "@database/schemas";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { createNotification } from "@lib/notifications/notifications";

export const prerender = false;

/** Get messages for a conversation. */
export const GET: APIRoute = async ({ params, request, url }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const convId = params.id;
  if (!convId) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = await getDrizzle();

  // Verify user is a participant
  const participation = await db
    .select()
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, convId),
        eq(conversationParticipant.userId, session.user.id),
      ),
    )
    .limit(1);

  if (participation.length === 0) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const messages = await db
    .select()
    .from(message)
    .where(eq(message.conversationId, convId))
    .orderBy(desc(message.sentAt))
    .limit(limit)
    .offset(offset);

  // Update last read
  await db
    .update(conversationParticipant)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipant.conversationId, convId),
        eq(conversationParticipant.userId, session.user.id),
      ),
    );

  return new Response(
    JSON.stringify({ messages, limit, offset }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};

/** Send a message in a conversation. */
export const POST: APIRoute = async ({ params, request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const convId = params.id;
  if (!convId) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  if (!body.content || body.content.length < 1) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "content required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();

  // Verify participation
  const participation = await db
    .select()
    .from(conversationParticipant)
    .where(
      and(
        eq(conversationParticipant.conversationId, convId),
        eq(conversationParticipant.userId, session.user.id),
      ),
    )
    .limit(1);

  if (participation.length === 0) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const msgId = randomUUID();

  await db.insert(message).values({
    id: msgId,
    conversationId: convId,
    senderId: session.user.id,
    content: body.content,
  });

  // Update conversation's lastMessageAt
  await db
    .update(conversation)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversation.id, convId));

  // Notify other participants
  const participants = await db
    .select({ userId: conversationParticipant.userId })
    .from(conversationParticipant)
    .where(eq(conversationParticipant.conversationId, convId));

  for (const p of participants) {
    if (p.userId !== session.user.id) {
      await createNotification({
        userId: p.userId,
        type: "message",
        title: "Nouveau message",
        body: body.content.substring(0, 100),
        targetType: "conversation",
        targetId: convId,
      });
    }
  }

  return new Response(
    JSON.stringify({ id: msgId }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};
