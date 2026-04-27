CREATE TYPE "public"."idea_status" AS ENUM('raw', 'exploring', 'greenlit', 'parked', 'killed');--> statement-breakpoint
CREATE TYPE "public"."social_platform" AS ENUM('instagram', 'facebook', 'youtube', 'linkedin');--> statement-breakpoint
CREATE TYPE "public"."social_status" AS ENUM('idea', 'drafting', 'ready', 'scheduled', 'posted');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('backlog', 'todo', 'in_progress', 'review', 'done');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "allowed_emails" (
	"email" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "idea_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" uuid NOT NULL,
	"url" text NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"status" "idea_status" DEFAULT 'raw',
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "social_platform" NOT NULL,
	"title" text NOT NULL,
	"caption" text,
	"hook" text,
	"cta" text,
	"hashtags" text,
	"media_notes" text,
	"status" "social_status" DEFAULT 'idea' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"posted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" NOT NULL,
	"priority" "task_priority" DEFAULT 'medium',
	"due_date" date,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "idea_links" ADD CONSTRAINT "idea_links_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idea_links_idea_id_idx" ON "idea_links" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ideas_updated_at_idx" ON "ideas" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "social_posts_platform_status_idx" ON "social_posts" USING btree ("platform","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "social_posts_scheduled_for_idx" ON "social_posts" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_status_position_idx" ON "tasks" USING btree ("status","position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_due_date_idx" ON "tasks" USING btree ("due_date");