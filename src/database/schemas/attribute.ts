import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const attributeValueTypeEnum = pgEnum("attribute_value_type", [
  "text",
  "number",
  "boolean",
  "select",
  "multi_select",
]);

export const attributeDefinition = pgTable(
  "attribute_definition",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    valueType: attributeValueTypeEnum("value_type").notNull(),
    possibleValues: text("possible_values").array(),
    applicableCategoryIds: text("applicable_category_ids").array(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("attr_def_slug_uidx").on(table.slug)],
);

export const attributeDefTranslation = pgTable(
  "attribute_def_translation",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    attributeDefinitionId: text("attribute_definition_id")
      .notNull()
      .references(() => attributeDefinition.id, { onDelete: "cascade" }),
    lang: text("lang").notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (table) => [
    uniqueIndex("attr_def_trans_attr_lang_uidx").on(
      table.attributeDefinitionId,
      table.lang,
    ),
    index("attr_def_trans_lang_idx").on(table.lang),
  ],
);

export const attributeDefinitionRelations = relations(
  attributeDefinition,
  ({ many }) => ({
    translations: many(attributeDefTranslation),
  }),
);

export const attributeDefTranslationRelations = relations(
  attributeDefTranslation,
  ({ one }) => ({
    attributeDefinition: one(attributeDefinition, {
      fields: [attributeDefTranslation.attributeDefinitionId],
      references: [attributeDefinition.id],
    }),
  }),
);
