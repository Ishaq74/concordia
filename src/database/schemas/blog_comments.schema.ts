import { pgTable, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Un seul schéma universel "blog_comments"
export const blogComments = pgTable("blog_comments", {
  id: text("id").primaryKey(),
  entityId: text("entity_id").notNull(), // ID de l'entité reliée (blog, event...)
  entityType: text("entity_type").notNull(), // 'blog', 'place', 'event', 'hike', 'classified'
  parentId: text("parent_id"), // Pour la récursivité/thread
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: jsonb("content").notNull(),
  rating: integer("rating").default(0),
  status: text("status").notNull(), // pending, approved, rejected
  inLanguage: text("in_language").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations pour threading, parent/replies
export const blogCommentsRelations = relations(blogComments, ({ one, many }) => ({
  parent: one(blogComments, {
    fields: [blogComments.parentId],
    references: [blogComments.id],
    relationName: "comment_replies",
  }),
  replies: many(blogComments, {
    relationName: "comment_replies",
  }),
}));

export const blogCommentsIndexes = `
CREATE INDEX idx_blog_comments_entity ON blog_comments(entity_id);
CREATE INDEX idx_blog_comments_type ON blog_comments(entity_type);
CREATE INDEX idx_blog_comments_status ON blog_comments(status);
CREATE INDEX idx_blog_comments_parent ON blog_comments(parent_id);
`;