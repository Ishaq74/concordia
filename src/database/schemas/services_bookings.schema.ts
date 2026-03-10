import { pgTable, integer, text, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { servicesListings } from "./services_listings.schema";

export const servicesBookings = pgTable("services_bookings", {
  id: text("id").primaryKey(),
  serviceId: text("service_id").notNull(),
  customerId: text("customer_id").notNull(),
  providerId: text("provider_id").notNull(),
  bookingDate: text("booking_date").notNull(),
  bookingTime: text("booking_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  totalPrice: text("total_price"),
  currency: text("currency").default("EUR"),
  status: text("status").notNull().default("pending"),
  customerMessage: text("customer_message"),
  providerResponse: text("provider_response"),
  cancelledAt: timestamp("cancelled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  foreignKey({ columns: [table.serviceId], foreignColumns: [servicesListings.id] }).onDelete("cascade"),
]);

export const servicesBookingsRelations = relations(servicesBookings, ({ one }) => ({
  service: one(servicesListings, {
    fields: [servicesBookings.serviceId],
    references: [servicesListings.id],
  }),
}));

export const servicesBookingsIndexes = `
CREATE INDEX idx_services_bookings_service ON services_bookings(service_id);
CREATE INDEX idx_services_bookings_customer ON services_bookings(customer_id);
CREATE INDEX idx_services_bookings_provider ON services_bookings(provider_id);
CREATE INDEX idx_services_bookings_status ON services_bookings(status);
CREATE INDEX idx_services_bookings_date ON services_bookings(booking_date);
`;
