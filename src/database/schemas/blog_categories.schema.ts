import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { blogMedia } from "./blog_media.schema";

export const blogCategories = pgTable("blog_categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").notNull(),
  description: jsonb("description"),
  featuredImageId: text("featured_image_id"),
  displayInHome: boolean("display_in_home").notNull().default(false),
  displayInMenu: boolean("display_in_menu").notNull().default(true),
  displayInBlog: boolean("display_in_blog").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  parentId: text("parent_id"),
  seoTitle: jsonb("seo_title"),
  seoDescription: jsonb("seo_description"),
  seoKeywords: jsonb("seo_keywords"),
  canonicalUrl: jsonb("canonical_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogCategoriesRelations = relations(blogCategories, ({ one }) => ({
  featuredImage: one(blogMedia, { fields: [blogCategories.featuredImageId], references: [blogMedia.id] }),
}));

export const blogCategoriesIndexes = `
CREATE UNIQUE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_categories_parent ON blog_categories(parent_id);
CREATE INDEX idx_blog_categories_home ON blog_categories(display_in_home);
CREATE INDEX idx_blog_categories_featured ON blog_categories(is_featured);
`;
