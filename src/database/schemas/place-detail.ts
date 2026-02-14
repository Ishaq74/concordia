import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { place } from "./place";

/** Accommodation-specific details (1:1 with place). PK = place_id. */
export const accommodationDetail = pgTable("accommodation_detail", {
  placeId: text("place_id")
    .primaryKey()
    .references(() => place.id, { onDelete: "cascade" }),
  stars: integer("stars"),
  accommodationType: text("accommodation_type"),
  capacity: integer("capacity"),
  petsAllowed: boolean("pets_allowed"),
  pool: boolean("pool"),
  spa: boolean("spa"),
  familyRooms: boolean("family_rooms"),
  bookingUrl: text("booking_url"),
  availability: jsonb("availability"),
});

/** Gastronomy-specific details (1:1 with place). PK = place_id. */
export const gastronomyDetail = pgTable("gastronomy_detail", {
  placeId: text("place_id")
    .primaryKey()
    .references(() => place.id, { onDelete: "cascade" }),
  cuisine: text("cuisine"),
  priceRange: text("price_range"),
  takeaway: boolean("takeaway"),
  delivery: boolean("delivery"),
  vegan: boolean("vegan"),
  brunch: boolean("brunch"),
  seatingCapacity: integer("seating_capacity"),
});

/** Activity-specific details (1:1 with place). PK = place_id. */
export const activityDetail = pgTable("activity_detail", {
  placeId: text("place_id")
    .primaryKey()
    .references(() => place.id, { onDelete: "cascade" }),
  durationMin: integer("duration_min"),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  priceMin: text("price_min"),
  priceMax: text("price_max"),
  seasons: text("seasons").array(),
});

export const accommodationDetailRelations = relations(
  accommodationDetail,
  ({ one }) => ({
    place: one(place, {
      fields: [accommodationDetail.placeId],
      references: [place.id],
    }),
  }),
);

export const gastronomyDetailRelations = relations(
  gastronomyDetail,
  ({ one }) => ({
    place: one(place, {
      fields: [gastronomyDetail.placeId],
      references: [place.id],
    }),
  }),
);

export const activityDetailRelations = relations(
  activityDetail,
  ({ one }) => ({
    place: one(place, {
      fields: [activityDetail.placeId],
      references: [place.id],
    }),
  }),
);
