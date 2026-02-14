import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const favorite = pgTable(
  "favorite",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("favorite_user_target_uidx").on(
      table.userId,
      table.targetType,
      table.targetId,
    ),
    index("favorite_user_id_idx").on(table.userId),
    index("favorite_target_idx").on(table.targetType, table.targetId),
  ],
);

export const favoriteRelations = relations(favorite, ({ one }) => ({
  user: one(user, {
    fields: [favorite.userId],
    references: [user.id],
  }),
}));
