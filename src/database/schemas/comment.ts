import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { article } from "./article";
import { place } from "./place";
import { trail } from "./trail";

export const commentTargetTypeEnum = pgEnum("comment_target_type", [
  "article",
  "place",
  "trail",
  "event",
  "product",
]);

export const commentStatusEnum = pgEnum("comment_status", [
  "published",
  "moderated",
  "deleted",
]);

export const comment = pgTable(
  "comment",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    parentCommentId: text("parent_comment_id"),
    targetType: commentTargetTypeEnum("target_type").notNull(),
    articleId: text("article_id").references(() => article.id, {
      onDelete: "cascade",
    }),
    placeId: text("place_id").references(() => place.id, {
      onDelete: "cascade",
    }),
    trailId: text("trail_id").references(() => trail.id, {
      onDelete: "cascade",
    }),
    eventId: text("event_id"),
    productId: text("product_id"),
    content: text("content").notNull(),
    status: commentStatusEnum("status").default("published").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("comment_author_id_idx").on(table.authorId),
    index("comment_target_type_idx").on(table.targetType),
    index("comment_article_id_idx").on(table.articleId),
    index("comment_place_id_idx").on(table.placeId),
    index("comment_trail_id_idx").on(table.trailId),
    index("comment_event_id_idx").on(table.eventId),
    index("comment_status_idx").on(table.status),
    index("comment_created_at_idx").on(table.createdAt),
  ],
);

export const commentRelations = relations(comment, ({ one, many }) => ({
  author: one(user, { fields: [comment.authorId], references: [user.id] }),
  parentComment: one(comment, {
    fields: [comment.parentCommentId],
    references: [comment.id],
    relationName: "commentThread",
  }),
  replies: many(comment, { relationName: "commentThread" }),
  article: one(article, {
    fields: [comment.articleId],
    references: [article.id],
  }),
  place: one(place, { fields: [comment.placeId], references: [place.id] }),
  trail: one(trail, { fields: [comment.trailId], references: [trail.id] }),
}));
