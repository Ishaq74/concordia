import { pgTable, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const comments = pgTable("comments", {
    id: text("id").primaryKey(),
    entityId: text("entity_id").notNull(),
    entityType: text("entity_type").notNull(), // 'blog', 'place', 'event', 'hike', 'classified'
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

export const commentsRelations = relations(comments, ({ one, many }) => ({
    parent: one(comments, {
        fields: [comments.parentId],
        references: [comments.id],
        relationName: "comment_replies",
    }),
    replies: many(comments, {
        relationName: "comment_replies",
    }),
}));
