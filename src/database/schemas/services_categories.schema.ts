import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { servicesMedia } from "./services_media.schema";

export const servicesCategories = pgTable("services_categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").notNull(),
  description: jsonb("description"),
  icon: text("icon"),
  featuredImageId: text("featured_image_id"),
  parentId: text("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  displayInHome: boolean("display_in_home").notNull().default(false),
  displayInMenu: boolean("display_in_menu").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  seoTitle: jsonb("seo_title"),
  seoDescription: jsonb("seo_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const servicesCategoriesRelations = relations(servicesCategories, ({ one }) => ({
  featuredImage: one(servicesMedia, {
    fields: [servicesCategories.featuredImageId],
    references: [servicesMedia.id],
  }),
}));

export const servicesCategoriesIndexes = `
CREATE UNIQUE INDEX idx_services_categories_slug ON services_categories(slug);
CREATE INDEX idx_services_categories_parent ON services_categories(parent_id);
CREATE INDEX idx_services_categories_sort ON services_categories(sort_order);
CREATE INDEX idx_services_categories_active ON services_categories(is_active);
`;
