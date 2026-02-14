import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const group = pgTable(
  "group",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    isPublic: boolean("is_public").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("group_slug_uidx").on(table.slug),
    index("group_created_by_idx").on(table.createdBy),
  ],
);

export const groupMember = pgTable(
  "group_member",
  {
    groupId: text("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.groupId, table.userId] }),
    index("group_member_user_idx").on(table.userId),
  ],
);

export const groupRelations = relations(group, ({ one, many }) => ({
  creator: one(user, { fields: [group.createdBy], references: [user.id] }),
  members: many(groupMember),
}));

export const groupMemberRelations = relations(groupMember, ({ one }) => ({
  group: one(group, {
    fields: [groupMember.groupId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [groupMember.userId],
    references: [user.id],
  }),
}));
