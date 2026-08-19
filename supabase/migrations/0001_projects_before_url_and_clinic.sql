-- Adds Hollywood Clinics, and the three schema changes it needs.
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every statement is guarded.

-- 1. the site a project replaced, when it is still online. `npm run shots`
--    captures it as <slug>-before.webp so the comparison shows the real old
--    site instead of the generic dated-web mock.
alter table public.projects add column if not exists before_url text;

-- 2. a line in the client's words, shown under the comparison
alter table public.projects add column if not exists tagline text;

-- 3. 'clinic' joins the themes. The check has to be dropped and re-added;
--    there is no "add value" for a check constraint the way there is for an
--    enum, and `create table if not exists` never touches an existing table.
alter table public.projects drop constraint if exists projects_theme_check;
alter table public.projects add  constraint projects_theme_check
  check (theme in ('montre','beauty','clinic'));

insert into public.projects
  (id, slug, title, badge, short, summary, url, before_url, accent, theme, tagline, points, sort_order)
values (
  'p-hollywood',
  'hollywood-clinics',
  'Hollywood Clinics',
  'Healthcare & Services',
  'Modern clinic platform, online booking and UI redesign.',
  'Complete digital transformation for a multi-specialty clinic network. Upgraded from an outdated legacy platform to a modern, responsive website featuring seamless appointment booking, doctor profiles, service showcases, and fast mobile performance.',
  'https://hollywoodclinics.net/',
  'https://website.hollywood-clinics.com/',
  '#0E7C7B',
  'clinic',
  'Transforming healthcare accessibility with a modern, patient-first web experience.',
  '["Complete website redesign and modern UI/UX implementation",
    "Online appointment and booking system setup",
    "Doctors and specialties directory structure",
    "Mobile-first optimisation and page speed enhancement",
    "Arabic and multi-language support integration"]'::jsonb,
  2
)
on conflict (id) do update set
  slug       = excluded.slug,
  title      = excluded.title,
  badge      = excluded.badge,
  short      = excluded.short,
  summary    = excluded.summary,
  url        = excluded.url,
  before_url = excluded.before_url,
  accent     = excluded.accent,
  theme      = excluded.theme,
  tagline    = excluded.tagline,
  points     = excluded.points,
  sort_order = excluded.sort_order;
