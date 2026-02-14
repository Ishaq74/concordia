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

export const trailDifficultyEnum = pgEnum("trail_difficulty", [
  "easy",
  "moderate",
  "hard",
]);

export const trail = pgTable(
  "trail",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    difficulty: trailDifficultyEnum("difficulty"),
    distanceKm: decimal("distance_km", { precision: 6, scale: 2 }),
    durationMin: integer("duration_min"),
    ascentM: integer("ascent_m"),
    descentM: integer("descent_m"),
    loop: boolean("loop").default(false).notNull(),
    gpxUrl: text("gpx_url"),
    type: text("type"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("trail_slug_uidx").on(table.slug),
    index("trail_created_by_idx").on(table.createdBy),
    index("trail_difficulty_idx").on(table.difficulty),
  ],
);

export const poi = pgTable(
  "poi",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    trailId: text("trail_id")
      .notNull()
      .references(() => trail.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    kmMarker: decimal("km_marker", { precision: 6, scale: 2 }),
  },
  (table) => [index("poi_trail_id_idx").on(table.trailId)],
);

export const trailRelations = relations(trail, ({ one, many }) => ({
  creator: one(user, { fields: [trail.createdBy], references: [user.id] }),
  pois: many(poi),
}));

export const poiRelations = relations(poi, ({ one }) => ({
  trail: one(trail, {
    fields: [poi.trailId],
    references: [trail.id],
  }),
}));
