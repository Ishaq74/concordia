import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { blogPosts } from "./blog_posts.schema";

export const blogTranslations = pgTable("blog_translations", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  inLanguage: text("in_language").notNull(),
  headline: jsonb("headline").notNull(),
  alternativeHeadline: jsonb("alternative_headline"),
  articleBody: jsonb("article_body").notNull(),
  excerpt: jsonb("excerpt").notNull(),
  seoTitle: jsonb("seo_title"),
  seoDescription: jsonb("seo_description"),
  seoKeywords: jsonb("seo_keywords"),
  canonicalUrl: jsonb("canonical_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogTranslationsRelations = relations(blogTranslations, ({ one }) => ({
  post: one(blogPosts, { fields: [blogTranslations.postId], references: [blogPosts.id] }),
}));

export const blogTranslationsIndexes = `
CREATE INDEX idx_blog_translations_post ON blog_translations(post_id);
CREATE INDEX idx_blog_translations_language ON blog_translations(in_language);
`;
