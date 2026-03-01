import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Extended user profile information beyond the core auth user table.
 */
export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  username: text("username"),
  fullName: text("full_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  location: text("location"),
  website: text("website"),
  preferredLanguage: text("preferred_language").default("fr"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
