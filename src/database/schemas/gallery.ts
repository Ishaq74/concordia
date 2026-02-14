import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const galleryMediaTypeEnum = pgEnum("gallery_media_type", [
  "image",
  "video",
]);

export const gallery = pgTable(
  "gallery",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("gallery_created_by_idx").on(table.createdBy)],
);

export const galleryItem = pgTable(
  "gallery_item",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    galleryId: text("gallery_id")
      .notNull()
      .references(() => gallery.id, { onDelete: "cascade" }),
    mediaUrl: text("media_url").notNull(),
    mediaType: galleryMediaTypeEnum("media_type").default("image").notNull(),
    caption: text("caption"),
    sortOrder: integer("sort_order").default(0).notNull(),
    uploadedBy: text("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("gallery_item_gallery_idx").on(table.galleryId),
    index("gallery_item_sort_idx").on(table.galleryId, table.sortOrder),
  ],
);

export const galleryRelations = relations(gallery, ({ one, many }) => ({
  creator: one(user, { fields: [gallery.createdBy], references: [user.id] }),
  items: many(galleryItem),
}));

export const galleryItemRelations = relations(galleryItem, ({ one }) => ({
  gallery: one(gallery, {
    fields: [galleryItem.galleryId],
    references: [gallery.id],
  }),
  uploader: one(user, {
    fields: [galleryItem.uploadedBy],
    references: [user.id],
  }),
}));
