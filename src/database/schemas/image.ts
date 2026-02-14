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

export const imageContentTypeEnum = pgEnum("image_content_type", [
  "place",
  "article",
  "profile",
  "event",
  "trail",
  "classified",
]);

export const image = pgTable(
  "image",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contentType: imageContentTypeEnum("content_type").notNull(),
    contentId: text("content_id").notNull(),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    altText: text("alt_text"),
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes"),
    mimeType: text("mime_type").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("image_content_idx").on(table.contentType, table.contentId),
    index("image_uploaded_by_idx").on(table.uploadedBy),
  ],
);

export const imageRelations = relations(image, ({ one }) => ({
  uploadedByUser: one(user, {
    fields: [image.uploadedBy],
    references: [user.id],
  }),
}));
