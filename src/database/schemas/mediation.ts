import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { conversation } from "./conversation";

export const mediationStatusEnum = pgEnum("mediation_status", [
  "opened",
  "assigned",
  "in_progress",
  "resolved",
  "failed",
  "closed",
]);

export const mediationPriorityEnum = pgEnum("mediation_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const mediationSessionStatusEnum = pgEnum("mediation_session_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const mediationCase = pgTable(
  "mediation_case",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    reportedUserId: text("reported_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    mediatorId: text("mediator_id").references(() => user.id, {
      onDelete: "set null",
    }),
    relatedEntityType: text("related_entity_type"),
    relatedEntityId: text("related_entity_id"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category"),
    priority: mediationPriorityEnum("priority").default("normal").notNull(),
    status: mediationStatusEnum("status").default("opened").notNull(),
    resolution: text("resolution"),
    openedAt: timestamp("opened_at").defaultNow().notNull(),
    assignedAt: timestamp("assigned_at"),
    resolvedAt: timestamp("resolved_at"),
    closedAt: timestamp("closed_at"),
  },
  (table) => [
    index("mediation_case_reporter_idx").on(table.reporterId),
    index("mediation_case_reported_idx").on(table.reportedUserId),
    index("mediation_case_mediator_idx").on(table.mediatorId),
    index("mediation_case_status_idx").on(table.status),
    index("mediation_case_priority_idx").on(table.priority),
  ],
);

export const mediationSession = pgTable(
  "mediation_session",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    caseId: text("case_id")
      .notNull()
      .references(() => mediationCase.id, { onDelete: "cascade" }),
    scheduledAt: timestamp("scheduled_at").notNull(),
    durationMinutes: integer("duration_minutes").default(60).notNull(),
    type: text("type").default("video").notNull(),
    notes: text("notes"),
    outcome: text("outcome"),
    status: mediationSessionStatusEnum("status")
      .default("scheduled")
      .notNull(),
    conversationId: text("conversation_id").references(() => conversation.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("mediation_session_case_idx").on(table.caseId),
    index("mediation_session_scheduled_idx").on(table.scheduledAt),
  ],
);

export const mediationAgreement = pgTable(
  "mediation_agreement",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    caseId: text("case_id")
      .notNull()
      .unique()
      .references(() => mediationCase.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    actions: jsonb("actions"),
    signedByReporter: boolean("signed_by_reporter").default(false).notNull(),
    signedByReported: boolean("signed_by_reported").default(false).notNull(),
    signedByMediator: boolean("signed_by_mediator").default(false).notNull(),
    signedAt: timestamp("signed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("mediation_agreement_case_uidx").on(table.caseId),
  ],
);

export const mediationCaseRelations = relations(
  mediationCase,
  ({ one, many }) => ({
    reporter: one(user, {
      fields: [mediationCase.reporterId],
      references: [user.id],
      relationName: "mediationReporter",
    }),
    reportedUser: one(user, {
      fields: [mediationCase.reportedUserId],
      references: [user.id],
      relationName: "mediationReported",
    }),
    mediator: one(user, {
      fields: [mediationCase.mediatorId],
      references: [user.id],
      relationName: "mediationMediator",
    }),
    sessions: many(mediationSession),
    agreement: one(mediationAgreement, {
      fields: [mediationCase.id],
      references: [mediationAgreement.caseId],
    }),
  }),
);

export const mediationSessionRelations = relations(
  mediationSession,
  ({ one }) => ({
    case: one(mediationCase, {
      fields: [mediationSession.caseId],
      references: [mediationCase.id],
    }),
    conversation: one(conversation, {
      fields: [mediationSession.conversationId],
      references: [conversation.id],
    }),
  }),
);

export const mediationAgreementRelations = relations(
  mediationAgreement,
  ({ one }) => ({
    case: one(mediationCase, {
      fields: [mediationAgreement.caseId],
      references: [mediationCase.id],
    }),
  }),
);
