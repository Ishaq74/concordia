import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const auditLog = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  userId: text("user_id"),
  targetId: text("target_id"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});