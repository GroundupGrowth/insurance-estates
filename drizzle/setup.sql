-- =============================================================
-- I&E PM Dashboard — one-shot setup for Neon
-- Paste this entire file into the Neon SQL Editor and run it.
-- Then edit and run the INSERT block at the bottom with your emails.
-- Safe to re-run; uses IF NOT EXISTS / DO $$ blocks.
-- =============================================================

-- Enums --------------------------------------------------------
DO $$ BEGIN CREATE TYPE "public"."idea_status"     AS ENUM ('raw','exploring','greenlit','parked','killed');     EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."social_platform" AS ENUM ('instagram','facebook','youtube','linkedin');         EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."social_status"   AS ENUM ('idea','drafting','ready','scheduled','posted');      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."task_priority"   AS ENUM ('low','medium','high');                                EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "public"."task_status"     AS ENUM ('backlog','todo','in_progress','review','done');      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables -------------------------------------------------------
CREATE TABLE IF NOT EXISTS "allowed_emails" (
  "email" text PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "ideas" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title"      text NOT NULL,
  "body"       text,
  "status"     "idea_status" DEFAULT 'raw',
  "tags"       text[] DEFAULT '{}'::text[] NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "idea_links" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "idea_id"    uuid NOT NULL,
  "url"        text NOT NULL,
  "label"      text,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "social_posts" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "platform"      "social_platform" NOT NULL,
  "title"         text NOT NULL,
  "caption"       text,
  "hook"          text,
  "cta"           text,
  "hashtags"      text,
  "media_notes"   text,
  "status"        "social_status" DEFAULT 'idea' NOT NULL,
  "scheduled_for" timestamp with time zone,
  "posted_at"     timestamp with time zone,
  "created_at"    timestamp with time zone DEFAULT now(),
  "updated_at"    timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title"       text NOT NULL,
  "description" text,
  "status"      "task_status" NOT NULL,
  "priority"    "task_priority" DEFAULT 'medium',
  "assignee"    text,
  "due_date"    date,
  "position"    integer DEFAULT 0 NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now(),
  "updated_at"  timestamp with time zone DEFAULT now()
);

-- Columns added after initial setup (safe to re-run).
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "assignee" text;

-- Foreign keys -------------------------------------------------
DO $$ BEGIN
  ALTER TABLE "idea_links"
    ADD CONSTRAINT "idea_links_idea_id_ideas_id_fk"
    FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes ------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idea_links_idea_id_idx"            ON "idea_links"   USING btree ("idea_id");
CREATE INDEX IF NOT EXISTS "ideas_updated_at_idx"              ON "ideas"        USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "social_posts_platform_status_idx"  ON "social_posts" USING btree ("platform","status");
CREATE INDEX IF NOT EXISTS "social_posts_scheduled_for_idx"    ON "social_posts" USING btree ("scheduled_for");
CREATE INDEX IF NOT EXISTS "tasks_status_position_idx"         ON "tasks"        USING btree ("status","position");
CREATE INDEX IF NOT EXISTS "tasks_due_date_idx"                ON "tasks"        USING btree ("due_date");

-- =============================================================
-- Seed allowed_emails
-- Replace the placeholder addresses with the two emails that
-- should be able to sign in, then run this block.
-- =============================================================
INSERT INTO "allowed_emails" ("email") VALUES
  ('owner@example.com'),
  ('teammate@example.com')
ON CONFLICT ("email") DO NOTHING;
