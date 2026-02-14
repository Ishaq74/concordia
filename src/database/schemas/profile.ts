import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const profile = pgTable(
  "profile",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    username: text("username").notNull().unique(),
    fullName: text("full_name"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    location: text("location"),
    website: text("website"),
    preferredLanguage: text("preferred_language").default("fr").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("profile_user_id_uidx").on(table.userId),
    uniqueIndex("profile_username_uidx").on(table.username),
    index("profile_location_idx").on(table.location),
  ],
);

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}));
