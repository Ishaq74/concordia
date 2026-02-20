import { pgTable, text } from "drizzle-orm/pg-core";

export const blogOrganizations = pgTable("blog_organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});
