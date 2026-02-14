import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const tag = pgTable(
  "tag",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("tag_slug_uidx").on(table.slug)],
);

export const tagTranslation = pgTable(
  "tag_translation",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
    lang: text("lang").notNull(),
    name: text("name").notNull(),
  },
  (table) => [
    uniqueIndex("tag_trans_tag_lang_uidx").on(table.tagId, table.lang),
    index("tag_trans_lang_idx").on(table.lang),
  ],
);

export const tagRelations = relations(tag, ({ many }) => ({
  translations: many(tagTranslation),
}));

export const tagTranslationRelations = relations(
  tagTranslation,
  ({ one }) => ({
    tag: one(tag, {
      fields: [tagTranslation.tagId],
      references: [tag.id],
    }),
  }),
);
