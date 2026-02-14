import { relations } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const product = pgTable("product", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  producerId: text("producer_id").references(() => user.id, {
    onDelete: "set null",
  }),
  isLocal: boolean("is_local").default(true).notNull(),
  seasonStart: integer("season_start"),
  seasonEnd: integer("season_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productRelations = relations(product, ({ one }) => ({
  producer: one(user, {
    fields: [product.producerId],
    references: [user.id],
  }),
}));
