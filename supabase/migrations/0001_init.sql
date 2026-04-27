-- Insurance & Estates PM Dashboard — initial schema
-- Run this in the Supabase SQL editor.

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- allowed_emails ------------------------------------------------------------
create table if not exists public.allowed_emails (
  email text primary key
);

-- Replace these placeholders with real allowed emails before running.
insert into public.allowed_emails (email) values
  ('owner@example.com'),
  ('teammate@example.com')
on conflict (email) do nothing;

-- tasks ---------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null check (status in ('backlog','todo','in_progress','review','done')),
  priority text check (priority in ('low','medium','high')) default 'medium',
  due_date date,
  position int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists tasks_status_position_idx on public.tasks (status, position);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

-- social_posts --------------------------------------------------------------
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram','facebook','youtube','linkedin')),
  title text not null,
  caption text,
  hook text,
  cta text,
  hashtags text,
  media_notes text,
  status text not null check (status in ('idea','drafting','ready','scheduled','posted')) default 'idea',
  scheduled_for timestamptz,
  posted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists social_posts_platform_status_idx on public.social_posts (platform, status);
create index if not exists social_posts_scheduled_for_idx on public.social_posts (scheduled_for);

-- ideas ---------------------------------------------------------------------
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  status text check (status in ('raw','exploring','greenlit','parked','killed')) default 'raw',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists ideas_updated_at_idx on public.ideas (updated_at desc);

-- idea_links ----------------------------------------------------------------
create table if not exists public.idea_links (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade,
  url text not null,
  label text,
  created_at timestamptz default now()
);
create index if not exists idea_links_idea_id_idx on public.idea_links (idea_id);

-- updated_at trigger --------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

drop trigger if exists social_posts_set_updated_at on public.social_posts;
create trigger social_posts_set_updated_at before update on public.social_posts
  for each row execute function public.set_updated_at();

drop trigger if exists ideas_set_updated_at on public.ideas;
create trigger ideas_set_updated_at before update on public.ideas
  for each row execute function public.set_updated_at();

-- RLS -----------------------------------------------------------------------
alter table public.tasks         enable row level security;
alter table public.social_posts  enable row level security;
alter table public.ideas         enable row level security;
alter table public.idea_links    enable row level security;
alter table public.allowed_emails enable row level security;

-- Helper: caller is in allowed_emails
create or replace function public.is_allowed()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_emails ae
    where lower(ae.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- tasks policies
drop policy if exists "tasks rw for allowed" on public.tasks;
create policy "tasks rw for allowed"
  on public.tasks
  for all
  to authenticated
  using (public.is_allowed())
  with check (public.is_allowed());

-- social_posts policies
drop policy if exists "social_posts rw for allowed" on public.social_posts;
create policy "social_posts rw for allowed"
  on public.social_posts
  for all
  to authenticated
  using (public.is_allowed())
  with check (public.is_allowed());

-- ideas policies
drop policy if exists "ideas rw for allowed" on public.ideas;
create policy "ideas rw for allowed"
  on public.ideas
  for all
  to authenticated
  using (public.is_allowed())
  with check (public.is_allowed());

-- idea_links policies
drop policy if exists "idea_links rw for allowed" on public.idea_links;
create policy "idea_links rw for allowed"
  on public.idea_links
  for all
  to authenticated
  using (public.is_allowed())
  with check (public.is_allowed());

-- allowed_emails: readable by signed-in allowed users; writes via service role only.
drop policy if exists "allowed_emails read for allowed" on public.allowed_emails;
create policy "allowed_emails read for allowed"
  on public.allowed_emails
  for select
  to authenticated
  using (public.is_allowed());
