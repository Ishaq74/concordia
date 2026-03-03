import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { servicesCategories } from "./services_categories.schema";
import { servicesMedia } from "./services_media.schema";
import { servicesTranslations } from "./services_translations.schema";
import { servicesReviews } from "./services_reviews.schema";
import { servicesAvailability } from "./services_availability.schema";
import { servicesBookings } from "./services_bookings.schema";
import { blogOrganizations } from "./blog_organization.schema";

export const servicesListings = pgTable("services_listings", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  categoryId: text("category_id"),
  providerId: text("provider_id").notNull(),
  organizationId: text("organization_id"),
  status: text("status").notNull().default("pending_review"),
  basePrice: text("base_price"),
  priceType: text("price_type"),
  currency: text("currency").default("EUR"),
  durationMinutes: integer("duration_minutes"),
  isMobile: boolean("is_mobile").notNull().default(false),
  maxParticipants: integer("max_participants"),
  bookingAdvanceHours: integer("booking_advance_hours"),
  cancellationHours: integer("cancellation_hours"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  displayInHome: boolean("display_in_home").notNull().default(false),
  allowReviews: boolean("allow_reviews").notNull().default(true),
  inLanguage: text("in_language").notNull().default("fr"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Join table: services_media_links
export const servicesMediaLinks = pgTable("services_media_links", {
  serviceId: text("service_id").notNull(),
  mediaId: text("media_id").notNull(),
  type: text("type").notNull(), // "cover", "gallery"
  position: text("position"),
});

// --- Relations ---

export const servicesListingsRelations = relations(servicesListings, ({ one, many }) => ({
  category: one(servicesCategories, {
    fields: [servicesListings.categoryId],
    references: [servicesCategories.id],
  }),
  organization: one(blogOrganizations, {
    fields: [servicesListings.organizationId],
    references: [blogOrganizations.id],
  }),
  translations: many(servicesTranslations),
  media: many(servicesMediaLinks),
  reviews: many(servicesReviews),
  availability: many(servicesAvailability),
  bookings: many(servicesBookings),
}));

export const servicesMediaLinksRelations = relations(servicesMediaLinks, ({ one }) => ({
  service: one(servicesListings, {
    fields: [servicesMediaLinks.serviceId],
    references: [servicesListings.id],
  }),
  media: one(servicesMedia, {
    fields: [servicesMediaLinks.mediaId],
    references: [servicesMedia.id],
  }),
}));

export const servicesListingsIndexes = `
CREATE UNIQUE INDEX idx_services_listings_slug ON services_listings(slug);
CREATE INDEX idx_services_listings_status ON services_listings(status);
CREATE INDEX idx_services_listings_category ON services_listings(category_id);
CREATE INDEX idx_services_listings_provider ON services_listings(provider_id);
CREATE INDEX idx_services_listings_org ON services_listings(organization_id);
CREATE INDEX idx_services_listings_featured ON services_listings(is_featured);
CREATE INDEX idx_services_listings_home ON services_listings(display_in_home);
CREATE INDEX idx_services_listings_active ON services_listings(is_active);

CREATE INDEX idx_services_media_links_service ON services_media_links(service_id);
CREATE INDEX idx_services_media_links_media ON services_media_links(media_id);
`;
