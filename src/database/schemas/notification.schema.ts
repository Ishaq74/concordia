import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const notification = pgTable('notification', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  message: text('message'),
  status: text('status'),
  targetType: text('target_type'),
  targetId: text('target_id'),
  data: jsonb('data').$type<Record<string, unknown> | null>(),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});