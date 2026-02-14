import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { category } from "./category";

export const forumThreadStatusEnum = pgEnum("forum_thread_status", [
  "published",
  "closed",
  "moderated",
  "deleted",
]);

export const forumPostStatusEnum = pgEnum("forum_post_status", [
  "published",
  "moderated",
  "deleted",
]);

export const forumThread = pgTable(
  "forum_thread",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "restrict" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    isPinned: boolean("is_pinned").default(false).notNull(),
    isLocked: boolean("is_locked").default(false).notNull(),
    status: forumThreadStatusEnum("status").default("published").notNull(),
    lastPostAt: timestamp("last_post_at"),
    postCount: integer("post_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("forum_thread_cat_slug_uidx").on(
      table.categoryId,
      table.slug,
    ),
    index("forum_thread_author_idx").on(table.authorId),
    index("forum_thread_category_idx").on(table.categoryId),
    index("forum_thread_status_idx").on(table.status),
    index("forum_thread_last_post_idx").on(table.lastPostAt),
  ],
);

export const forumPost = pgTable(
  "forum_post",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    threadId: text("thread_id")
      .notNull()
      .references(() => forumThread.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    parentPostId: text("parent_post_id"),
    content: text("content").notNull(),
    status: forumPostStatusEnum("status").default("published").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("forum_post_thread_idx").on(table.threadId),
    index("forum_post_author_idx").on(table.authorId),
    index("forum_post_created_idx").on(table.createdAt),
  ],
);

export const forumThreadRelations = relations(forumThread, ({ one, many }) => ({
  category: one(category, {
    fields: [forumThread.categoryId],
    references: [category.id],
  }),
  author: one(user, {
    fields: [forumThread.authorId],
    references: [user.id],
  }),
  posts: many(forumPost),
}));

export const forumPostRelations = relations(forumPost, ({ one, many }) => ({
  thread: one(forumThread, {
    fields: [forumPost.threadId],
    references: [forumThread.id],
  }),
  author: one(user, { fields: [forumPost.authorId], references: [user.id] }),
  parentPost: one(forumPost, {
    fields: [forumPost.parentPostId],
    references: [forumPost.id],
    relationName: "forumPostReplies",
  }),
  replies: many(forumPost, { relationName: "forumPostReplies" }),
}));
