import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { category } from "./category";

export const educationDifficultyEnum = pgEnum("education_difficulty", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const educationModuleStatusEnum = pgEnum("education_module_status", [
  "draft",
  "published",
  "archived",
]);

export const educationLessonTypeEnum = pgEnum("education_lesson_type", [
  "text",
  "video",
  "exercise",
  "quiz",
]);

export const educationEnrollmentStatusEnum = pgEnum(
  "education_enrollment_status",
  ["active", "completed", "dropped"],
);

export const educationModule = pgTable(
  "education_module",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    educatorId: text("educator_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    coverImageUrl: text("cover_image_url"),
    difficulty: educationDifficultyEnum("difficulty")
      .default("beginner")
      .notNull(),
    estimatedDurationHours: decimal("estimated_duration_hours", {
      precision: 5,
      scale: 1,
    }),
    isFree: boolean("is_free").default(true).notNull(),
    price: decimal("price", { precision: 12, scale: 2 }),
    lessonCount: integer("lesson_count").default(0).notNull(),
    enrollmentCount: integer("enrollment_count").default(0).notNull(),
    status: educationModuleStatusEnum("status").default("draft").notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("edu_module_slug_uidx").on(table.slug),
    index("edu_module_educator_idx").on(table.educatorId),
    index("edu_module_category_idx").on(table.categoryId),
    index("edu_module_status_idx").on(table.status),
    index("edu_module_difficulty_idx").on(table.difficulty),
  ],
);

export const educationLesson = pgTable(
  "education_lesson",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    moduleId: text("module_id")
      .notNull()
      .references(() => educationModule.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    contentJson: jsonb("content_json").default([]).notNull(),
    type: educationLessonTypeEnum("type").default("text").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    estimatedMinutes: integer("estimated_minutes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("edu_lesson_module_slug_uidx").on(table.moduleId, table.slug),
    uniqueIndex("edu_lesson_module_order_uidx").on(
      table.moduleId,
      table.sortOrder,
    ),
    index("edu_lesson_module_idx").on(table.moduleId),
  ],
);

export const educationEnrollment = pgTable(
  "education_enrollment",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    moduleId: text("module_id")
      .notNull()
      .references(() => educationModule.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: educationEnrollmentStatusEnum("status")
      .default("active")
      .notNull(),
    progressPercent: decimal("progress_percent", { precision: 5, scale: 2 })
      .default("0.00")
      .notNull(),
    completedAt: timestamp("completed_at"),
    paymentTransactionId: text("payment_transaction_id"),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("edu_enrollment_module_user_uidx").on(
      table.moduleId,
      table.userId,
    ),
    index("edu_enrollment_user_idx").on(table.userId),
    index("edu_enrollment_module_idx").on(table.moduleId),
  ],
);

export const educationProgress = pgTable(
  "education_progress",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => educationEnrollment.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => educationLesson.id, { onDelete: "cascade" }),
    isCompleted: boolean("is_completed").default(false).notNull(),
    score: decimal("score", { precision: 5, scale: 1 }),
    timeSpentSeconds: integer("time_spent_seconds"),
    completedAt: timestamp("completed_at"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("edu_progress_enrollment_lesson_uidx").on(
      table.enrollmentId,
      table.lessonId,
    ),
    index("edu_progress_enrollment_idx").on(table.enrollmentId),
  ],
);

export const educationModuleRelations = relations(
  educationModule,
  ({ one, many }) => ({
    educator: one(user, {
      fields: [educationModule.educatorId],
      references: [user.id],
    }),
    category: one(category, {
      fields: [educationModule.categoryId],
      references: [category.id],
    }),
    lessons: many(educationLesson),
    enrollments: many(educationEnrollment),
  }),
);

export const educationLessonRelations = relations(
  educationLesson,
  ({ one, many }) => ({
    module: one(educationModule, {
      fields: [educationLesson.moduleId],
      references: [educationModule.id],
    }),
    progress: many(educationProgress),
  }),
);

export const educationEnrollmentRelations = relations(
  educationEnrollment,
  ({ one, many }) => ({
    module: one(educationModule, {
      fields: [educationEnrollment.moduleId],
      references: [educationModule.id],
    }),
    user: one(user, {
      fields: [educationEnrollment.userId],
      references: [user.id],
    }),
    progressEntries: many(educationProgress),
  }),
);

export const educationProgressRelations = relations(
  educationProgress,
  ({ one }) => ({
    enrollment: one(educationEnrollment, {
      fields: [educationProgress.enrollmentId],
      references: [educationEnrollment.id],
    }),
    lesson: one(educationLesson, {
      fields: [educationProgress.lessonId],
      references: [educationLesson.id],
    }),
  }),
);
