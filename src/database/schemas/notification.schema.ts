import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const notification = pgTable('notification', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // e.g. 'info', 'warning', 'error', 'success'
  status: text('status').notNull(), // e.g. 'unread', 'read', 'archived'
  isRead: boolean('isRead').default(false),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt'),
});