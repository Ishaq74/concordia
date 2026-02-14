import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { volunteerProject } from "./volunteer";

export const fundingCampaignStatusEnum = pgEnum("funding_campaign_status", [
  "draft",
  "active",
  "funded",
  "expired",
  "cancelled",
]);

export const fundingCampaign = pgTable(
  "funding_campaign",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    projectId: text("project_id").references(() => volunteerProject.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    goalAmount: decimal("goal_amount", { precision: 12, scale: 2 }).notNull(),
    raisedAmount: decimal("raised_amount", { precision: 12, scale: 2 })
      .default("0.00")
      .notNull(),
    donorCount: integer("donor_count").default(0).notNull(),
    currency: text("currency").default("EUR").notNull(),
    deadline: date("deadline").notNull(),
    status: fundingCampaignStatusEnum("status").default("draft").notNull(),
    fundedAt: timestamp("funded_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("funding_campaign_slug_uidx").on(table.slug),
    index("funding_campaign_creator_idx").on(table.creatorId),
    index("funding_campaign_project_idx").on(table.projectId),
    index("funding_campaign_status_idx").on(table.status),
    index("funding_campaign_deadline_idx").on(table.deadline),
  ],
);

export const donation = pgTable(
  "donation",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => fundingCampaign.id, { onDelete: "restrict" }),
    donorId: text("donor_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    message: text("message"),
    transactionId: text("transaction_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("donation_campaign_idx").on(table.campaignId),
    index("donation_donor_idx").on(table.donorId),
  ],
);

export const fundingCampaignRelations = relations(
  fundingCampaign,
  ({ one, many }) => ({
    creator: one(user, {
      fields: [fundingCampaign.creatorId],
      references: [user.id],
    }),
    project: one(volunteerProject, {
      fields: [fundingCampaign.projectId],
      references: [volunteerProject.id],
    }),
    donations: many(donation),
  }),
);

export const donationRelations = relations(donation, ({ one }) => ({
  campaign: one(fundingCampaign, {
    fields: [donation.campaignId],
    references: [fundingCampaign.id],
  }),
  donor: one(user, {
    fields: [donation.donorId],
    references: [user.id],
  }),
}));
