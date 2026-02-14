import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  decimal,
  date,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const impactMetricTypeEnum = pgEnum("impact_metric_type", [
  "projects_completed",
  "volunteer_hours",
  "funds_raised",
  "mediations_resolved",
  "lessons_completed",
  "active_citizens",
  "resources_shared",
]);

export const impactMetric = pgTable(
  "impact_metric",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    type: impactMetricTypeEnum("type").notNull(),
    value: decimal("value", { precision: 12, scale: 2 }).notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    scope: text("scope").default("global").notNull(),
    metadata: jsonb("metadata"),
    computedAt: timestamp("computed_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("impact_metric_type_period_scope_uidx").on(
      table.type,
      table.periodStart,
      table.periodEnd,
      table.scope,
    ),
    index("impact_metric_type_idx").on(table.type),
    index("impact_metric_period_idx").on(table.periodStart, table.periodEnd),
  ],
);

export const transparencyReportStatusEnum = pgEnum(
  "transparency_report_status",
  ["draft", "published"],
);

export const transparencyReport = pgTable(
  "transparency_report",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    contentJson: jsonb("content_json").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    metricIds: text("metric_ids").array(),
    publishedBy: text("published_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    status: transparencyReportStatusEnum("status").default("draft").notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("transparency_report_slug_uidx").on(table.slug),
    index("transparency_report_status_idx").on(table.status),
    index("transparency_report_period_idx").on(
      table.periodStart,
      table.periodEnd,
    ),
  ],
);

export const transparencyReportRelations = relations(
  transparencyReport,
  ({ one }) => ({
    publisher: one(user, {
      fields: [transparencyReport.publishedBy],
      references: [user.id],
    }),
  }),
);
