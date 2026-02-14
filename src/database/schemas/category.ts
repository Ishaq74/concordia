import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const categoryTypeEnum = pgEnum("category_type", [
  "place",
  "magazine",
  "forum",
  "classified",
  "service",
  "education",
  "project",
]);

export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    parentId: text("parent_id"),
    slug: text("slug").notNull(),
    type: categoryTypeEnum("type").notNull(),
    icon: text("icon"),
    level: integer("level").default(1).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("category_parent_slug_uidx").on(table.parentId, table.slug),
    index("category_type_idx").on(table.type),
    index("category_parent_id_idx").on(table.parentId),
  ],
);

export const categoryTranslation = pgTable(
  "category_translation",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    lang: text("lang").notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (table) => [
    uniqueIndex("cat_trans_category_lang_uidx").on(
      table.categoryId,
      table.lang,
    ),
    index("cat_trans_lang_idx").on(table.lang),
  ],
);

export const categoryRelations = relations(category, ({ one, many }) => ({
  parent: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: "categoryParent",
  }),
  children: many(category, { relationName: "categoryParent" }),
  translations: many(categoryTranslation),
}));

export const categoryTranslationRelations = relations(
  categoryTranslation,
  ({ one }) => ({
    category: one(category, {
      fields: [categoryTranslation.categoryId],
      references: [category.id],
    }),
  }),
);
