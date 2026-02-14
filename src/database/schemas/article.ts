import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { category } from "./category";
import { place } from "./place";

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "pending_review",
  "published",
  "archived",
  "rejected",
]);

export const article = pgTable(
  "article",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary"),
    coverImageUrl: text("cover_image_url"),
    status: articleStatusEnum("status").default("draft").notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("article_slug_uidx").on(table.slug),
    index("article_author_id_idx").on(table.authorId),
    index("article_status_idx").on(table.status),
    index("article_published_at_idx").on(table.publishedAt),
  ],
);

export const articleContent = pgTable(
  "article_content",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    articleId: text("article_id")
      .notNull()
      .references(() => article.id, { onDelete: "cascade" }),
    language: text("language").default("fr").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    contentJson: jsonb("content_json").default([]).notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("article_content_article_lang_uidx").on(
      table.articleId,
      table.language,
    ),
  ],
);

export const articleCategoryLink = pgTable(
  "article_category_link",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => article.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.categoryId] })],
);

export const articlePlaceLink = pgTable(
  "article_place_link",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => article.id, { onDelete: "cascade" }),
    placeId: text("place_id")
      .notNull()
      .references(() => place.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.placeId] })],
);

export const articlePlaceComparison = pgTable(
  "article_place_comparison",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    articleId: text("article_id")
      .notNull()
      .references(() => article.id, { onDelete: "cascade" }),
    placeIds: text("place_ids").array().notNull(),
    comparisonCriteria: text("comparison_criteria").array().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("article_place_comp_article_idx").on(table.articleId)],
);

export const articleRelations = relations(article, ({ one, many }) => ({
  author: one(user, { fields: [article.authorId], references: [user.id] }),
  contents: many(articleContent),
  categoryLinks: many(articleCategoryLink),
  placeLinks: many(articlePlaceLink),
  comparisons: many(articlePlaceComparison),
}));

export const articleContentRelations = relations(
  articleContent,
  ({ one }) => ({
    article: one(article, {
      fields: [articleContent.articleId],
      references: [article.id],
    }),
  }),
);

export const articleCategoryLinkRelations = relations(
  articleCategoryLink,
  ({ one }) => ({
    article: one(article, {
      fields: [articleCategoryLink.articleId],
      references: [article.id],
    }),
    category: one(category, {
      fields: [articleCategoryLink.categoryId],
      references: [category.id],
    }),
  }),
);

export const articlePlaceLinkRelations = relations(
  articlePlaceLink,
  ({ one }) => ({
    article: one(article, {
      fields: [articlePlaceLink.articleId],
      references: [article.id],
    }),
    place: one(place, {
      fields: [articlePlaceLink.placeId],
      references: [place.id],
    }),
  }),
);

export const articlePlaceComparisonRelations = relations(
  articlePlaceComparison,
  ({ one }) => ({
    article: one(article, {
      fields: [articlePlaceComparison.articleId],
      references: [article.id],
    }),
  }),
);
