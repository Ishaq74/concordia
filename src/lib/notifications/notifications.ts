import { getDrizzle } from "@database/drizzle";
import { notification } from "@database/schemas";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export type NotificationType =
  | "review"
  | "message"
  | "booking"
  | "moderation"
  | "mediation"
  | "system"
  | "donation"
  | "education"
  | "volunteer";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  targetType?: string;
  targetId?: string;
  data?: Record<string, unknown>;
}

const sseClients = new Map<string, Set<ReadableStreamDefaultController>>();

export function registerSSEClient(
  userId: string,
  controller: ReadableStreamDefaultController,
) {
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId)!.add(controller);
}

export function removeSSEClient(
  userId: string,
  controller: ReadableStreamDefaultController,
) {
  const clients = sseClients.get(userId);
  if (clients) {
    clients.delete(controller);
    if (clients.size === 0) {
      sseClients.delete(userId);
    }
  }
}

function pushToSSE(userId: string, payload: Record<string, unknown>) {
  const clients = sseClients.get(userId);
  if (!clients) return;

  const data = `data: ${JSON.stringify(payload)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);

  for (const controller of clients) {
    try {
      controller.enqueue(encoded);
    } catch {
      clients.delete(controller);
    }
  }
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<string> {
  const db = await getDrizzle();
  const id = randomUUID();

  await db.insert(notification).values({
    id,
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    data: input.data ?? null,
    isRead: false,
  });

  pushToSSE(input.userId, {
    event: "notification",
    id,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
  });

  return id;
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
): Promise<boolean> {
  const db = await getDrizzle();
  const result = await db
    .update(notification)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(eq(notification.id, notificationId), eq(notification.userId, userId)),
    );
  return (result as any).rowCount > 0;
}

export async function markAllNotificationsRead(
  userId: string,
): Promise<number> {
  const db = await getDrizzle();
  const result = await db
    .update(notification)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(eq(notification.userId, userId), eq(notification.isRead, false)),
    );
  return (result as any).rowCount ?? 0;
}

export async function getUserNotifications(
  userId: string,
  options: { limit?: number; offset?: number; unreadOnly?: boolean } = {},
) {
  const db = await getDrizzle();
  const { limit = 20, offset = 0, unreadOnly = false } = options;

  const conditions = [eq(notification.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notification.isRead, false));
  }

  return db
    .select()
    .from(notification)
    .where(and(...conditions))
    .orderBy(desc(notification.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const db = await getDrizzle();
  const result = await db
    .select()
    .from(notification)
    .where(
      and(eq(notification.userId, userId), eq(notification.isRead, false)),
    );
  return result.length;
}
