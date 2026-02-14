import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  decimal,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { category } from "./category";
import { address } from "./address";

export const placeTypeEnum = pgEnum("place_type", [
  "restaurant",
  "hotel",
  "camping",
  "commerce",
  "admin",
  "activity",
  "poi",
  "trail",
  "balade",
  "randonnee",
  "velo",
]);

export const placeStatusEnum = pgEnum("place_status", [
  "pending_review",
  "published",
  "archived",
  "rejected",
]);

export const priceRangeEnum = pgEnum("price_range", [
  "low",
  "medium",
  "high",
  "luxury",
]);

export const place = pgTable(
  "place",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(),
    type: placeTypeEnum("type").notNull(),
    addressId: text("address_id").references(() => address.id, {
      onDelete: "set null",
    }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    openHours: jsonb("open_hours"),
    accessibility: text("accessibility").array(),
    audience: text("audience").array(),
    priceRange: priceRangeEnum("price_range"),
    ratingAvg: decimal("rating_avg", { precision: 2, scale: 1 }),
    ratingCount: integer("rating_count").default(0).notNull(),
    status: placeStatusEnum("status").default("pending_review").notNull(),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("place_slug_uidx").on(table.slug),
    index("place_owner_id_idx").on(table.ownerId),
    index("place_category_id_idx").on(table.categoryId),
    index("place_status_idx").on(table.status),
    index("place_rating_avg_idx").on(table.ratingAvg),
    index("place_lat_lng_idx").on(table.latitude, table.longitude),
  ],
);

export const placeTranslation = pgTable(
  "place_translation",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    placeId: text("place_id")
      .notNull()
      .references(() => place.id, { onDelete: "cascade" }),
    language: text("language").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("place_trans_place_lang_uidx").on(table.placeId, table.language),
    index("place_trans_lang_idx").on(table.language),
  ],
);

export const placeRelations = relations(place, ({ one, many }) => ({
  owner: one(user, { fields: [place.ownerId], references: [user.id] }),
  category: one(category, {
    fields: [place.categoryId],
    references: [category.id],
  }),
  address: one(address, {
    fields: [place.addressId],
    references: [address.id],
  }),
  translations: many(placeTranslation),
}));

export const placeTranslationRelations = relations(
  placeTranslation,
  ({ one }) => ({
    place: one(place, {
      fields: [placeTranslation.placeId],
      references: [place.id],
    }),
  }),
);
