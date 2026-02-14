import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  time,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { category } from "./category";
import { place } from "./place";

export const localServiceStatusEnum = pgEnum("local_service_status", [
  "active",
  "pending_review",
  "suspended",
  "archived",
]);

export const localService = pgTable(
  "local_service",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    providerId: text("provider_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    placeId: text("place_id").references(() => place.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    basePrice: decimal("base_price", { precision: 12, scale: 2 }),
    priceType: text("price_type"),
    currency: text("currency").default("EUR").notNull(),
    durationMinutes: integer("duration_minutes"),
    isMobile: boolean("is_mobile").default(false).notNull(),
    maxParticipants: integer("max_participants"),
    bookingAdvanceHours: integer("booking_advance_hours"),
    cancellationHours: integer("cancellation_hours"),
    isActive: boolean("is_active").default(true).notNull(),
    status: localServiceStatusEnum("status").default("pending_review").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("local_service_provider_idx").on(table.providerId),
    index("local_service_category_idx").on(table.categoryId),
    index("local_service_place_idx").on(table.placeId),
    index("local_service_status_idx").on(table.status),
  ],
);

export const serviceAvailability = pgTable(
  "service_availability",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    serviceId: text("service_id")
      .notNull()
      .references(() => localService.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("service_avail_service_day_time_uidx").on(
      table.serviceId,
      table.dayOfWeek,
      table.startTime,
    ),
    index("service_avail_service_idx").on(table.serviceId),
  ],
);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled_by_client",
  "cancelled_by_provider",
  "completed",
  "no_show",
]);

export const booking = pgTable(
  "booking",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    providerId: text("provider_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => localService.id, { onDelete: "restrict" }),
    bookingDate: date("booking_date").notNull(),
    bookingTime: time("booking_time").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    totalPrice: decimal("total_price", { precision: 12, scale: 2 }),
    status: bookingStatusEnum("status").default("pending").notNull(),
    customerMessage: text("customer_message"),
    providerResponse: text("provider_response"),
    paymentTransactionId: text("payment_transaction_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("booking_customer_idx").on(table.customerId),
    index("booking_provider_idx").on(table.providerId),
    index("booking_service_idx").on(table.serviceId),
    index("booking_status_idx").on(table.status),
    index("booking_date_idx").on(table.bookingDate),
  ],
);

export const localServiceRelations = relations(
  localService,
  ({ one, many }) => ({
    provider: one(user, {
      fields: [localService.providerId],
      references: [user.id],
    }),
    category: one(category, {
      fields: [localService.categoryId],
      references: [category.id],
    }),
    place: one(place, {
      fields: [localService.placeId],
      references: [place.id],
    }),
    availabilities: many(serviceAvailability),
    bookings: many(booking),
  }),
);

export const serviceAvailabilityRelations = relations(
  serviceAvailability,
  ({ one }) => ({
    service: one(localService, {
      fields: [serviceAvailability.serviceId],
      references: [localService.id],
    }),
  }),
);

export const bookingRelations = relations(booking, ({ one }) => ({
  customer: one(user, {
    fields: [booking.customerId],
    references: [user.id],
    relationName: "bookingCustomer",
  }),
  provider: one(user, {
    fields: [booking.providerId],
    references: [user.id],
    relationName: "bookingProvider",
  }),
  service: one(localService, {
    fields: [booking.serviceId],
    references: [localService.id],
  }),
}));
