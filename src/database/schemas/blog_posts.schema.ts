import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { blogTranslations } from "./blog_translations.schema";
import { blogAuthors } from "./blog_authors.schema";
import { blogCategories } from "./blog_categories.schema";
import { blogMedia } from "./blog_media.schema";
import { blogComments } from "./blog_comments.schema";

export const blogPosts = pgTable("blog_posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull(),
  publishedAt: timestamp("published_at"),
  displayInHome: boolean("display_in_home").notNull().default(false),
  displayInBlog: boolean("display_in_blog").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  readingTime: text("reading_time"),
  wordCount: text("word_count"),
  timeRequired: text("time_required"),
  allowComments: boolean("allow_comments").notNull().default(true),
  inLanguage: text("in_language").notNull(),
  license: text("license"),
  discussionUrl: text("discussion_url"),
  url: text("url"),
  identifier: text("identifier"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogPostAuthors = pgTable("blog_post_authors", {
  postId: text("post_id").notNull(),
  authorId: text("author_id").notNull(),
});

export const blogPostCategories = pgTable("blog_post_categories", {
  postId: text("post_id").notNull(),
  categoryId: text("category_id").notNull(),
});

export const blogPostMedia = pgTable("blog_post_media", {
  postId: text("post_id").notNull(),
  mediaId: text("media_id").notNull(),
  type: text("type").notNull(),
  position: text("position"),
});

export const blogPostsRelations = relations(blogPosts, ({ many }) => ({
  authors: many(blogPostAuthors),
  categories: many(blogPostCategories),
  media: many(blogPostMedia),
  translations: many(blogTranslations),
  comments: many(blogComments),
}));

export const blogPostAuthorsRelations = relations(blogPostAuthors, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostAuthors.postId],
    references: [blogPosts.id],
  }),
  author: one(blogAuthors, {
    fields: [blogPostAuthors.authorId],
    references: [blogAuthors.id],
  }),
}));

export const blogPostCategoriesRelations = relations(blogPostCategories, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostCategories.postId],
    references: [blogPosts.id],
  }),
  category: one(blogCategories, {
    fields: [blogPostCategories.categoryId],
    references: [blogCategories.id],
  }),
}));

export const blogPostMediaRelations = relations(blogPostMedia, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostMedia.postId],
    references: [blogPosts.id],
  }),
  media: one(blogMedia, {
    fields: [blogPostMedia.mediaId],
    references: [blogMedia.id],
  }),
}));

export const blogPostsIndexes = `
CREATE UNIQUE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_home ON blog_posts(display_in_home);
CREATE INDEX idx_blog_posts_featured ON blog_posts(is_featured);

CREATE INDEX idx_blog_post_authors_post ON blog_post_authors(post_id);
CREATE INDEX idx_blog_post_authors_author ON blog_post_authors(author_id);

CREATE INDEX idx_blog_post_categories_post ON blog_post_categories(post_id);
CREATE INDEX idx_blog_post_categories_category ON blog_post_categories(category_id);

CREATE INDEX idx_blog_post_media_post ON blog_post_media(post_id);
CREATE INDEX idx_blog_post_media_media ON blog_post_media(media_id);
`;