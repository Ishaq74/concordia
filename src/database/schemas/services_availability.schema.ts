import { pgTable, integer, text, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { servicesListings } from "./services_listings.schema";

export const servicesAvailability = pgTable("services_availability", {
  id: text("id").primaryKey(),
  serviceId: text("service_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 (dim) → 6 (sam)
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_services_availability_unique").on(
    table.serviceId,
    table.dayOfWeek,
    table.startTime,
  ),
]);

export const servicesAvailabilityRelations = relations(servicesAvailability, ({ one }) => ({
  service: one(servicesListings, {
    fields: [servicesAvailability.serviceId],
    references: [servicesListings.id],
  }),
}));

export const servicesAvailabilityIndexes = `
CREATE INDEX idx_services_availability_service ON services_availability(service_id);
`;
