import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  decimal,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { place } from "./place";
import { attributeDefinition } from "./attribute";

export const placeAttributeValue = pgTable(
  "place_attribute_value",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    placeId: text("place_id")
      .notNull()
      .references(() => place.id, { onDelete: "cascade" }),
    attributeId: text("attribute_id")
      .notNull()
      .references(() => attributeDefinition.id, { onDelete: "cascade" }),
    valueBoolean: boolean("value_boolean"),
    valueString: text("value_string"),
    valueInteger: integer("value_integer"),
    valueDecimal: decimal("value_decimal", { precision: 10, scale: 2 }),
  },
  (table) => [
    uniqueIndex("place_attr_val_place_attr_uidx").on(
      table.placeId,
      table.attributeId,
    ),
    index("place_attr_val_place_idx").on(table.placeId),
  ],
);

export const placeAttributeValueRelations = relations(
  placeAttributeValue,
  ({ one }) => ({
    place: one(place, {
      fields: [placeAttributeValue.placeId],
      references: [place.id],
    }),
    attributeDefinition: one(attributeDefinition, {
      fields: [placeAttributeValue.attributeId],
      references: [attributeDefinition.id],
    }),
  }),
);
