import {
  pgTable,
  text,
  timestamp,
  decimal,
  index,
} from "drizzle-orm/pg-core";

export const address = pgTable(
  "address",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    street: text("street"),
    city: text("city").notNull(),
    postcode: text("postcode"),
    region: text("region"),
    country: text("country"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("address_city_idx").on(table.city),
    index("address_country_idx").on(table.country),
  ],
);
