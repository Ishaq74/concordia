import { pgTable, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { blogPosts } from "./blog_posts.schema";

export const blogComments = pgTable("blog_comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  parentId: text("parent_id"),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: jsonb("content").notNull(),
  rating: integer("rating").default(0),
  status: text("status").notNull(), // pending, approved, rejected
  inLanguage: text("in_language").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  post: one(blogPosts, { fields: [blogComments.postId], references: [blogPosts.id] }),
}));

export const blogCommentsIndexes = `
CREATE INDEX idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_status ON blog_comments(status);
CREATE INDEX idx_blog_comments_parent ON blog_comments(parent_id);
`;
