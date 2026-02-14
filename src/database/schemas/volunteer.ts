import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  decimal,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { category } from "./category";

export const volunteerProjectStatusEnum = pgEnum("volunteer_project_status", [
  "draft",
  "recruiting",
  "in_progress",
  "completed",
  "cancelled",
]);

export const volunteerTaskStatusEnum = pgEnum("volunteer_task_status", [
  "open",
  "filled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const volunteerParticipationStatusEnum = pgEnum(
  "volunteer_participation_status",
  ["signed_up", "confirmed", "completed", "no_show", "cancelled"],
);

export const volunteerProject = pgTable(
  "volunteer_project",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    coordinatorId: text("coordinator_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    location: text("location"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    startDate: date("start_date"),
    endDate: date("end_date"),
    volunteerGoal: integer("volunteer_goal"),
    volunteerCount: integer("volunteer_count").default(0).notNull(),
    fundingGoal: decimal("funding_goal", { precision: 12, scale: 2 }),
    fundingRaised: decimal("funding_raised", { precision: 12, scale: 2 })
      .default("0.00")
      .notNull(),
    status: volunteerProjectStatusEnum("status").default("draft").notNull(),
    impactSummary: text("impact_summary"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("volunteer_project_slug_uidx").on(table.slug),
    index("volunteer_project_coordinator_idx").on(table.coordinatorId),
    index("volunteer_project_status_idx").on(table.status),
    index("volunteer_project_category_idx").on(table.categoryId),
  ],
);

export const volunteerTask = pgTable(
  "volunteer_task",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
      .notNull()
      .references(() => volunteerProject.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    requiredSkills: text("required_skills").array(),
    maxVolunteers: integer("max_volunteers"),
    currentVolunteers: integer("current_volunteers").default(0).notNull(),
    scheduledDate: date("scheduled_date"),
    estimatedHours: decimal("estimated_hours", { precision: 5, scale: 1 }),
    status: volunteerTaskStatusEnum("status").default("open").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("volunteer_task_project_idx").on(table.projectId),
    index("volunteer_task_status_idx").on(table.status),
    index("volunteer_task_date_idx").on(table.scheduledDate),
  ],
);

export const volunteerParticipation = pgTable(
  "volunteer_participation",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    taskId: text("task_id")
      .notNull()
      .references(() => volunteerTask.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: volunteerParticipationStatusEnum("status")
      .default("signed_up")
      .notNull(),
    hoursLogged: decimal("hours_logged", { precision: 5, scale: 1 }),
    feedback: text("feedback"),
    signedUpAt: timestamp("signed_up_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    uniqueIndex("volunteer_part_task_user_uidx").on(table.taskId, table.userId),
    index("volunteer_part_user_idx").on(table.userId),
    index("volunteer_part_task_idx").on(table.taskId),
  ],
);

export const volunteerProjectRelations = relations(
  volunteerProject,
  ({ one, many }) => ({
    coordinator: one(user, {
      fields: [volunteerProject.coordinatorId],
      references: [user.id],
    }),
    category: one(category, {
      fields: [volunteerProject.categoryId],
      references: [category.id],
    }),
    tasks: many(volunteerTask),
  }),
);

export const volunteerTaskRelations = relations(
  volunteerTask,
  ({ one, many }) => ({
    project: one(volunteerProject, {
      fields: [volunteerTask.projectId],
      references: [volunteerProject.id],
    }),
    participations: many(volunteerParticipation),
  }),
);

export const volunteerParticipationRelations = relations(
  volunteerParticipation,
  ({ one }) => ({
    task: one(volunteerTask, {
      fields: [volunteerParticipation.taskId],
      references: [volunteerTask.id],
    }),
    user: one(user, {
      fields: [volunteerParticipation.userId],
      references: [user.id],
    }),
  }),
);
