import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { category } from "./category";

export const classifiedConditionEnum = pgEnum("classified_condition", [
  "new",
  "used",
  "damaged",
]);

export const classifiedStatusEnum = pgEnum("classified_status", [
  "pending_review",
  "active",
  "sold",
  "expired",
  "archived",
  "rejected",
]);

export const classified = pgTable(
  "classified",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: decimal("price", { precision: 12, scale: 2 }),
    condition: classifiedConditionEnum("condition"),
    location: text("location"),
    status: classifiedStatusEnum("status").default("pending_review").notNull(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("classified_seller_idx").on(table.sellerId),
    index("classified_category_idx").on(table.categoryId),
    index("classified_status_idx").on(table.status),
    index("classified_expires_idx").on(table.expiresAt),
  ],
);

export const classifiedRelations = relations(classified, ({ one }) => ({
  seller: one(user, {
    fields: [classified.sellerId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [classified.categoryId],
    references: [category.id],
  }),
}));
