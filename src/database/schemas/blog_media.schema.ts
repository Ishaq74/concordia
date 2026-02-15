import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const blogMedia = pgTable("blog_media", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  contentUrl: text("content_url"),
  type: text("type").notNull(), // image, video, audio
  encodingFormat: text("encoding_format"),
  width: text("width"),
  height: text("height"),
  duration: text("duration"),
  license: text("license"),
  copyrightHolder: text("copyright_holder"),
  caption: jsonb("caption"),
  description: jsonb("description"),
  alt: jsonb("alt"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogMediaIndexes = `
CREATE INDEX idx_blog_media_type ON blog_media(type);
CREATE INDEX idx_blog_media_url ON blog_media(url);
`;
