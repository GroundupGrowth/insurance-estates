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

export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "paused",
  "archived",
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
    assignee: text("assignee"),
    projectId: uuid("project_id"),
    dueDate: date("due_date"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    statusPositionIdx: index("tasks_status_position_idx").on(t.status, t.position),
    dueDateIdx: index("tasks_due_date_idx").on(t.dueDate),
    projectIdIdx: index("tasks_project_id_idx").on(t.projectId),
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
    projectId: uuid("project_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    platformStatusIdx: index("social_posts_platform_status_idx").on(t.platform, t.status),
    scheduledForIdx: index("social_posts_scheduled_for_idx").on(t.scheduledFor),
    projectIdIdx: index("social_posts_project_id_idx").on(t.projectId),
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
    projectId: uuid("project_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    updatedAtIdx: index("ideas_updated_at_idx").on(t.updatedAt),
    projectIdIdx: index("ideas_project_id_idx").on(t.projectId),
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

export const socialLinks = pgTable(
  "social_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => socialPosts.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    label: text("label"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    postIdIdx: index("social_links_post_id_idx").on(t.postId),
  }),
);

export const socialChannels = pgTable("social_channels", {
  platform: socialPlatformEnum("platform").primaryKey(),
  driveUrl: text("drive_url"),
  accountUrl: text("account_url"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    topic: text("topic"),
    description: text("description"),
    owner: text("owner"),
    url: text("url"),
    color: text("color").default("#2E5A87"),
    notes: text("notes"),
    status: projectStatusEnum("status").notNull().default("active"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    statusIdx: index("projects_status_idx").on(t.status),
  }),
);

export const socialCompetitors = pgTable(
  "social_competitors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    platform: socialPlatformEnum("platform").notNull(),
    name: text("name").notNull(),
    url: text("url"),
    notes: text("notes"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    platformIdx: index("social_competitors_platform_idx").on(t.platform),
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
export type SocialLink = typeof socialLinks.$inferSelect;
export type NewSocialLink = typeof socialLinks.$inferInsert;
export type SocialChannel = typeof socialChannels.$inferSelect;
export type NewSocialChannel = typeof socialChannels.$inferInsert;
export type SocialCompetitor = typeof socialCompetitors.$inferSelect;
export type NewSocialCompetitor = typeof socialCompetitors.$inferInsert;
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentType: text("parent_type").notNull(),
    parentId: uuid("parent_id").notNull(),
    author: text("author"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    parentIdx: index("comments_parent_idx").on(t.parentType, t.parentId),
  }),
);

export const activity = pgTable(
  "activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentType: text("parent_type").notNull(),
    parentId: uuid("parent_id").notNull(),
    actor: text("actor"),
    action: text("action").notNull(),
    meta: text("meta"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    parentIdx: index("activity_parent_idx").on(t.parentType, t.parentId),
  }),
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Activity = typeof activity.$inferSelect;
export type NewActivity = typeof activity.$inferInsert;
