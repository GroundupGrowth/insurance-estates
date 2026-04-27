import {
  pgTable,
  text,
  uuid,
  date,
  integer,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const taskStatusEnum = pgEnum("task_status", [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const socialPlatformEnum = pgEnum("social_platform", [
  "instagram",
  "facebook",
  "youtube",
  "linkedin",
]);

export const socialStatusEnum = pgEnum("social_status", [
  "idea",
  "drafting",
  "ready",
  "scheduled",
  "posted",
]);

export const ideaStatusEnum = pgEnum("idea_status", [
  "raw",
  "exploring",
  "greenlit",
  "parked",
  "killed",
]);

export const allowedEmails = pgTable("allowed_emails", {
  email: text("email").primaryKey(),
});

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull(),
    priority: taskPriorityEnum("priority").default("medium"),
    dueDate: date("due_date"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    statusPositionIdx: index("tasks_status_position_idx").on(t.status, t.position),
    dueDateIdx: index("tasks_due_date_idx").on(t.dueDate),
  }),
);

export const socialPosts = pgTable(
  "social_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    platform: socialPlatformEnum("platform").notNull(),
    title: text("title").notNull(),
    caption: text("caption"),
    hook: text("hook"),
    cta: text("cta"),
    hashtags: text("hashtags"),
    mediaNotes: text("media_notes"),
    status: socialStatusEnum("status").notNull().default("idea"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    platformStatusIdx: index("social_posts_platform_status_idx").on(t.platform, t.status),
    scheduledForIdx: index("social_posts_scheduled_for_idx").on(t.scheduledFor),
  }),
);

export const ideas = pgTable(
  "ideas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    body: text("body"),
    status: ideaStatusEnum("status").default("raw"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    updatedAtIdx: index("ideas_updated_at_idx").on(t.updatedAt),
  }),
);

export const ideaLinks = pgTable(
  "idea_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    ideaIdIdx: index("idea_links_idea_id_idx").on(t.ideaId),
  }),
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type SocialPost = typeof socialPosts.$inferSelect;
export type NewSocialPost = typeof socialPosts.$inferInsert;
export type Idea = typeof ideas.$inferSelect;
export type NewIdea = typeof ideas.$inferInsert;
export type IdeaLink = typeof ideaLinks.$inferSelect;
export type NewIdeaLink = typeof ideaLinks.$inferInsert;
