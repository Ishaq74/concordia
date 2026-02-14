import {
  pgTable,
  text,
  boolean,
  timestamp,
  decimal,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const systemCommission = pgTable(
  "system_commission",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull().unique(),
    percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
    flatFee: decimal("flat_fee", { precision: 8, scale: 2 })
      .default("0.00")
      .notNull(),
    appliesTo: text("applies_to").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("system_commission_name_uidx").on(table.name)],
);
