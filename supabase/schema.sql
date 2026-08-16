-- =====================================================================
-- StarSolution — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- =====================================================================

-- ---------- content tables ----------
-- One shape covers solutions, goals, systems, automations and team, because
-- the site renders them all through the same detail template.

create table if not exists public.solutions (
  id           text primary key,
  slug         text not null unique,
  title        text not null,
  eyebrow      text,
  summary      text,
  short        text,
  icon         text,
  tone         text,
  badge        text,
  stats        jsonb default '[]'::jsonb,
  points       jsonb default '[]'::jsonb,
  video        jsonb,
  sort_order   int  default 0,
  created_at   timestamptz default now()
);

create table if not exists public.goals (
  id           text primary key,
  slug         text not null unique,
  title        text not null,
  eyebrow      text,
  summary      text,
  short        text,
  icon         text,
  tone         text,
  metric       text,
  "metricLabel" text,
  stats        jsonb default '[]'::jsonb,
  points       jsonb default '[]'::jsonb,
  video        jsonb,
  sort_order   int  default 0
);

create table if not exists public.case_studies (
  id           text primary key,
  slug         text not null unique,
  title        text not null,
  eyebrow      text,
  summary      text,
  type         text,
  kpi          text,
  "kpiUnit"    text,
  "kpiLabel"   text,
  before       text,
  after        text,
  delta        text,
  period       text,
  c1           text,
  c2           text,
  stats        jsonb default '[]'::jsonb,
  points       jsonb default '[]'::jsonb,
  video        jsonb,
  sort_order   int  default 0
);

create table if not exists public.systems (
  id           text primary key,
  slug         text not null unique,
  title        text not null,
  eyebrow      text,
  summary      text,
  short        text,
  tag          text,
  stats        jsonb default '[]'::jsonb,
  points       jsonb default '[]'::jsonb,
  video        jsonb,
  sort_order   int  default 0
);

create table if not exists public.automations (
  id           text primary key,
  slug         text not null unique,
  title        text not null,
  eyebrow      text,
  summary      text,
  stats        jsonb default '[]'::jsonb,
  points       jsonb default '[]'::jsonb,
  video        jsonb,
  sort_order   int  default 0
);

create table if not exists public.team (
  id           text primary key,
  slug         text not null unique,
  title        text not null,
  eyebrow      text,
  summary      text,
  role         text,
  initials     text,
  tone         text,
  tagline      text,
  points       jsonb default '[]'::jsonb,
  sort_order   int  default 0
);

-- for projects created before `tagline` existed
alter table public.team add column if not exists tagline text;

create table if not exists public.testimonials (
  id           text primary key,
  name         text not null,
  role         text,
  quote        text not null,
  initials     text,
  tone         text,
  sort_order   int default 0
);

create table if not exists public.projects (
  id           text primary key,
  slug         text not null unique,
  title        text not null,
  badge        text,
  short        text,
  summary      text,
  url          text,
  accent       text,
  theme        text check (theme in ('montre','beauty')),
  points       jsonb default '[]'::jsonb,
  sort_order   int default 0
);

-- ---------- form submissions ----------
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  company    text,
  message    text,
  created_at timestamptz default now()
);

-- ---------- row level security ----------
-- Content is public read-only. Leads are write-only from the server, which
-- uses the service role key and bypasses RLS.

alter table public.solutions     enable row level security;
alter table public.goals         enable row level security;
alter table public.case_studies  enable row level security;
alter table public.systems       enable row level security;
alter table public.automations   enable row level security;
alter table public.team          enable row level security;
alter table public.testimonials  enable row level security;
alter table public.projects      enable row level security;
alter table public.leads         enable row level security;

-- Postgres has no "create policy if not exists", so drop first to stay re-runnable.
do $$
declare t text;
begin
  foreach t in array array['solutions','goals','case_studies','systems','automations','team','testimonials','projects']
  loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', t);
    execute format(
      'create policy "public read %1$s" on public.%1$I for select using (true)', t
    );
  end loop;
end $$;

-- No public policy on leads: nothing can read or write it with the anon key.
