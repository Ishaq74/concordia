import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { category } from "./category";
import { place } from "./place";

export const eventTypeEnum = pgEnum("event_type", [
  "culture",
  "sport",
  "marche",
  "local",
  "asso",
  "education",
  "volunteer",
]);

export const event = pgTable(
  "event",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    placeId: text("place_id").references(() => place.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    type: eventTypeEnum("type"),
    startAt: timestamp("start_at").notNull(),
    endAt: timestamp("end_at"),
    maxParticipants: integer("max_participants"),
    registrationDeadline: timestamp("registration_deadline"),
    isPaid: boolean("is_paid").default(false).notNull(),
    price: decimal("price", { precision: 12, scale: 2 }),
    recurrenceRule: text("recurrence_rule"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("event_slug_uidx").on(table.slug),
    index("event_created_by_idx").on(table.createdBy),
    index("event_start_at_idx").on(table.startAt),
    index("event_category_id_idx").on(table.categoryId),
    index("event_place_id_idx").on(table.placeId),
  ],
);

export const eventRegistrationStatusEnum = pgEnum("event_registration_status", [
  "registered",
  "cancelled",
  "attended",
  "no_show",
]);

export const eventPaymentStatusEnum = pgEnum("event_payment_status", [
  "pending",
  "completed",
  "refunded",
]);

export const eventRegistration = pgTable(
  "event_registration",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: eventRegistrationStatusEnum("status")
      .default("registered")
      .notNull(),
    amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }),
    paymentStatus: eventPaymentStatusEnum("payment_status"),
    paymentReference: text("payment_reference"),
    registeredAt: timestamp("registered_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("event_reg_event_user_uidx").on(table.eventId, table.userId),
    index("event_reg_event_idx").on(table.eventId),
    index("event_reg_user_idx").on(table.userId),
  ],
);

export const eventRelations = relations(event, ({ one, many }) => ({
  creator: one(user, { fields: [event.createdBy], references: [user.id] }),
  category: one(category, {
    fields: [event.categoryId],
    references: [category.id],
  }),
  place: one(place, { fields: [event.placeId], references: [place.id] }),
  registrations: many(eventRegistration),
}));

export const eventRegistrationRelations = relations(
  eventRegistration,
  ({ one }) => ({
    event: one(event, {
      fields: [eventRegistration.eventId],
      references: [event.id],
    }),
    user: one(user, {
      fields: [eventRegistration.userId],
      references: [user.id],
    }),
  }),
);
