import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const notification = pgTable('notification', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  message: text('message'),
  status: text('status'),
  targetType: text('targetType'),
  targetId: text('targetId'),
  data: jsonb('data').$type<Record<string, unknown> | null>(),
  isRead: boolean('isRead').default(false),
  readAt: timestamp('readAt'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt'),
});