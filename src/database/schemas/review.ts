import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  decimal,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { place } from "./place";

export const reviewStatusEnum = pgEnum("review_status", [
  "published",
  "moderated",
  "deleted",
]);

export const review = pgTable(
  "review",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    placeId: text("place_id")
      .notNull()
      .references(() => place.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    parentReviewId: text("parent_review_id"),
    title: text("title"),
    content: text("content").notNull(),
    rating: decimal("rating", { precision: 2, scale: 1 }),
    status: reviewStatusEnum("status").default("published").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("review_place_id_idx").on(table.placeId),
    index("review_author_id_idx").on(table.authorId),
    index("review_status_idx").on(table.status),
    uniqueIndex("review_author_place_root_uidx").on(
      table.authorId,
      table.placeId,
    ),
  ],
);

export const subRating = pgTable(
  "sub_rating",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    reviewId: text("review_id")
      .notNull()
      .references(() => review.id, { onDelete: "cascade" }),
    criterion: text("criterion").notNull(),
    score: decimal("score", { precision: 2, scale: 1 }).notNull(),
  },
  (table) => [
    uniqueIndex("sub_rating_review_criterion_uidx").on(
      table.reviewId,
      table.criterion,
    ),
    index("sub_rating_review_idx").on(table.reviewId),
  ],
);

export const reviewRelations = relations(review, ({ one, many }) => ({
  place: one(place, { fields: [review.placeId], references: [place.id] }),
  author: one(user, { fields: [review.authorId], references: [user.id] }),
  parentReview: one(review, {
    fields: [review.parentReviewId],
    references: [review.id],
    relationName: "reviewReplies",
  }),
  replies: many(review, { relationName: "reviewReplies" }),
  subRatings: many(subRating),
}));

export const subRatingRelations = relations(subRating, ({ one }) => ({
  review: one(review, {
    fields: [subRating.reviewId],
    references: [review.id],
  }),
}));
