-- =====================================================================
-- StarSolution — admin dashboard migration
-- Run AFTER schema.sql and seed.sql.
-- =====================================================================

-- ---------- who may use the dashboard ----------
-- Membership is a table rather than user metadata so access can be granted
-- and revoked from the Supabase dashboard without touching auth.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  created_at timestamptz default now()
);

alter table public.admins enable row level security;

-- An admin may read the admins table (the dashboard checks its own membership).
drop policy if exists "admins read self" on public.admins;
create policy "admins read self"
  on public.admins for select
  using (auth.uid() = user_id);

-- ---------- lead workflow ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum ('new', 'in_progress', 'contacted', 'closed');
  end if;
end $$;

alter table public.leads
  add column if not exists status lead_status not null default 'new',
  add column if not exists updated_at timestamptz default now();

create index if not exists leads_status_idx     on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Internal follow-up notes, one row per comment, newest first in the UI.
create table if not exists public.lead_notes (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  author_id  uuid references auth.users(id) on delete set null,
  body       text not null,
  created_at timestamptz default now()
);

create index if not exists lead_notes_lead_idx on public.lead_notes (lead_id, created_at desc);

alter table public.lead_notes enable row level security;

-- ---------- content bookkeeping ----------
-- Deliberately no second publish flag here: schema.sql already defines
-- `hidden`, which visible() in lib/content.ts filters on. Two columns for
-- one job drift apart as soon as somebody toggles the wrong one, so
-- `hidden` stays the single source of truth and the policies below read it.
do $$
declare t text;
begin
  foreach t in array array[
    'solutions','goals','case_studies','systems','automations','team','testimonials','projects'
  ]
  loop
    execute format('alter table public.%I add column if not exists updated_at timestamptz default now()', t);
  end loop;
end $$;

alter table public.projects add column if not exists hidden boolean default false;

-- ---------- policies ----------
-- Helper: is the caller an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- Admins get full control of leads and notes. Anonymous visitors get nothing:
-- the public form writes through the server route with the service role key.
drop policy if exists "admins manage leads" on public.leads;
create policy "admins manage leads" on public.leads
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage lead notes" on public.lead_notes;
create policy "admins manage lead notes" on public.lead_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- Content: the public may read published rows; admins may do anything.
do $$
declare t text;
begin
  foreach t in array array[
    'solutions','goals','case_studies','systems','automations','team','testimonials','projects'
  ]
  loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', t);
    execute format(
      'create policy "public read %1$s" on public.%1$I for select using (not coalesce(hidden, false) or public.is_admin())', t);
    execute format('drop policy if exists "admins write %1$s" on public.%1$I', t);
    execute format(
      'create policy "admins write %1$s" on public.%1$I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ---------- keep updated_at honest ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'leads','solutions','goals','case_studies','systems','automations','team','testimonials','projects'
  ]
  loop
    execute format('drop trigger if exists touch_%1$s on public.%1$I', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$I
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- =====================================================================
-- Create your first admin
-- ---------------------------------------------------------------------
-- 1. Supabase Dashboard → Authentication → Users → Add user
--    (set a password and tick "Auto Confirm User")
-- 2. Copy the new user's UID, then run:
--
--    insert into public.admins (user_id, full_name)
--    values ('PASTE-UID-HERE', 'Heba Hesham');
-- =====================================================================
