import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const appRoleEnum = pgEnum("app_role", [
  "citizen",
  "owner",
  "author",
  "mediator",
  "educator",
  "moderator",
  "admin",
]);

export const userRole = pgTable(
  "user_role",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: appRoleEnum("role").notNull(),
    grantedBy: text("granted_by").references(() => user.id, {
      onDelete: "set null",
    }),
    grantedAt: timestamp("granted_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_role_user_role_uidx").on(table.userId, table.role),
    index("user_role_user_id_idx").on(table.userId),
    index("user_role_role_idx").on(table.role),
  ],
);

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id],
  }),
  grantedByUser: one(user, {
    fields: [userRole.grantedBy],
    references: [user.id],
    relationName: "grantedByUser",
  }),
}));
