import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { blogMedia } from "./blog_media.schema";
import { blogOrganizations } from "./blog_organization.schema";

export const blogAuthors = pgTable("blog_authors", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  givenName: jsonb("given_name"),
  familyName: jsonb("family_name"),
  displayName: jsonb("display_name").notNull(),
  bio: jsonb("bio"),
  jobTitle: jsonb("job_title"),
  email: text("email").unique(),
  avatarId: text("avatar_id"),
  avatarUrl: text("avatar_url"),
  website: text("website"),
  sameAs: jsonb("same_as"),
  worksForId: text("works_for_id"),
  displayInHome: boolean("display_in_home").notNull().default(false),
  displayInBlog: boolean("display_in_blog").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  seoTitle: jsonb("seo_title"),
  seoDescription: jsonb("seo_description"),
  seoKeywords: jsonb("seo_keywords"),
  canonicalUrl: jsonb("canonical_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogAuthorsRelations = relations(blogAuthors, ({ one }) => ({
  avatar: one(blogMedia, { fields: [blogAuthors.avatarId], references: [blogMedia.id] }),
  organization: one(blogOrganizations, { fields: [blogAuthors.worksForId], references: [blogOrganizations.id] }),
}));

export const blogAuthorsIndexes = `
CREATE UNIQUE INDEX idx_blog_authors_slug ON blog_authors(slug);
CREATE INDEX idx_blog_authors_home ON blog_authors(display_in_home);
CREATE INDEX idx_blog_authors_featured ON blog_authors(is_featured);
CREATE INDEX idx_blog_authors_email ON blog_authors(email);
`;
