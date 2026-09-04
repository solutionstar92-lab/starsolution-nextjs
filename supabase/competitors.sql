-- =====================================================================
-- StarSolution — competitors access
-- Run AFTER admin.sql, which defines public.is_admin().
-- Safe to run more than once.
-- =====================================================================

-- The table itself was created by hand in the dashboard, so this only
-- establishes who may use it. Columns are left exactly as they are:
--   id uuid primary key default, name, website, email, phone,
--   strengths, weaknesses, notes, created_at
--
-- A probe with the anon key confirmed RLS is already on and refusing inserts
-- (42501), which is right — but a SELECT returning an empty array proves
-- nothing either way, and with no policy at all the dashboard cannot read the
-- table either. This grants the dashboard access and no one else any.

alter table public.competitors enable row level security;

-- Admins get full control. There is deliberately no public policy: this is
-- internal research and the site never reads it.
drop policy if exists "admins manage competitors" on public.competitors;
create policy "admins manage competitors" on public.competitors
  for all using (public.is_admin()) with check (public.is_admin());

-- Keeps ordering stable when two competitors share a name.
create index if not exists competitors_name_idx on public.competitors (name);

-- =====================================================================
-- Optional
-- ---------------------------------------------------------------------
-- The dashboard works without these; it detects their absence and drops the
-- ordering column and the publish switch from the Competitors screen. Run
-- them only if you want competitors to behave like the content tables, then
-- set `orderBy: 'sort_order'` and remove `hideable: false` from the
-- competitors entry in src/lib/admin/entities.ts.
--
--   alter table public.competitors add column if not exists sort_order int default 0;
--   alter table public.competitors add column if not exists hidden boolean default false;
--   alter table public.competitors add column if not exists updated_at timestamptz default now();
--   drop trigger if exists touch_competitors on public.competitors;
--   create trigger touch_competitors before update on public.competitors
--     for each row execute function public.touch_updated_at();
-- =====================================================================
