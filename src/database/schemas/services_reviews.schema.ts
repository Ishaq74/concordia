import { pgTable, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { servicesListings } from "./services_listings.schema";

export const servicesReviews = pgTable("services_reviews", {
  id: text("id").primaryKey(),
  serviceId: text("service_id").notNull(),
  parentId: text("parent_id"),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  authorId: text("author_id"),
  content: jsonb("content").notNull(),
  rating: integer("rating").notNull(),
  status: text("status").notNull().default("pending"),
  inLanguage: text("in_language").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const servicesReviewsRelations = relations(servicesReviews, ({ one, many }) => ({
  service: one(servicesListings, {
    fields: [servicesReviews.serviceId],
    references: [servicesListings.id],
  }),
  parent: one(servicesReviews, {
    fields: [servicesReviews.parentId],
    references: [servicesReviews.id],
    relationName: "review_replies",
  }),
  replies: many(servicesReviews, {
    relationName: "review_replies",
  }),
}));

export const servicesReviewsIndexes = `
CREATE INDEX idx_services_reviews_service ON services_reviews(service_id);
CREATE INDEX idx_services_reviews_status ON services_reviews(status);
CREATE INDEX idx_services_reviews_rating ON services_reviews(rating);
CREATE INDEX idx_services_reviews_parent ON services_reviews(parent_id);
CREATE INDEX idx_services_reviews_author ON services_reviews(author_id);
`;
