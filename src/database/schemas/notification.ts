import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const notificationTypeEnum = pgEnum("notification_type", [
  "review",
  "message",
  "booking",
  "moderation",
  "mediation",
  "system",
  "donation",
  "education",
  "volunteer",
]);

export const notification = pgTable(
  "notification",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    targetType: text("target_type"),
    targetId: text("target_id"),
    data: jsonb("data"),
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notification_user_id_idx").on(table.userId),
    index("notification_user_read_idx").on(table.userId, table.isRead),
    index("notification_type_idx").on(table.type),
    index("notification_created_at_idx").on(table.createdAt),
  ],
);

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));
