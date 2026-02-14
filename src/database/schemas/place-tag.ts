import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { place } from "./place";
import { tag } from "./tag";

export const placeTag = pgTable(
  "place_tag",
  {
    placeId: text("place_id")
      .notNull()
      .references(() => place.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.placeId, table.tagId] })],
);

export const placeTagRelations = relations(placeTag, ({ one }) => ({
  place: one(place, {
    fields: [placeTag.placeId],
    references: [place.id],
  }),
  tag: one(tag, {
    fields: [placeTag.tagId],
    references: [tag.id],
  }),
}));
