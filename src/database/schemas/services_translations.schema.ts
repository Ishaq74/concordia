import { pgTable, text, timestamp, jsonb, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { servicesListings } from "./services_listings.schema";

export const servicesTranslations = pgTable("services_translations", {
  id: text("id").primaryKey(),
  serviceId: text("service_id").notNull(),
  inLanguage: text("in_language").notNull(),
  title: jsonb("title").notNull(),
  description: jsonb("description").notNull(),
  shortDescription: jsonb("short_description"),
  seoTitle: jsonb("seo_title"),
  seoDescription: jsonb("seo_description"),
  seoKeywords: jsonb("seo_keywords"),
  canonicalUrl: jsonb("canonical_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  foreignKey({ columns: [table.serviceId], foreignColumns: [servicesListings.id] }).onDelete("cascade"),
]);

export const servicesTranslationsRelations = relations(servicesTranslations, ({ one }) => ({
  service: one(servicesListings, {
    fields: [servicesTranslations.serviceId],
    references: [servicesListings.id],
  }),
}));

export const servicesTranslationsIndexes = `
CREATE INDEX idx_services_translations_service ON services_translations(service_id);
CREATE INDEX idx_services_translations_language ON services_translations(in_language);
`;
