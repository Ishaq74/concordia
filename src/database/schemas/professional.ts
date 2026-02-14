import { relations } from "drizzle-orm";
import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { place } from "./place";

export const professional = pgTable("professional", {
  placeId: text("place_id")
    .primaryKey()
    .references(() => place.id, { onDelete: "cascade" }),
  siret: text("siret"),
  sector: text("sector"),
  emergencySupport: boolean("emergency_support").default(false).notNull(),
  emergencyPhone: text("emergency_phone"),
});

export const professionalRelations = relations(professional, ({ one }) => ({
  place: one(place, {
    fields: [professional.placeId],
    references: [place.id],
  }),
}));
