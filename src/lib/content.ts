import seed from '@/data/site.json';
import { getSupabase } from './supabase';
import type { Entry, SiteContent } from './types';

const local = seed as unknown as SiteContent;

/**
 * Content loader.
 *
 * Every page calls these. When Supabase is configured the matching table is
 * queried; when it is not — or the query fails — the bundled seed data is used.
 * That means `npm run dev` works immediately after clone, and pointing it at a
 * real project is a matter of filling in .env.local.
 */
async function fromTable<T>(table: string, fallback: T[]): Promise<T[]> {
  const db = getSupabase();
  if (!db) return fallback;
  try {
    const { data, error } = await db.from(table).select('*').order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return fallback;
    return data as T[];
  } catch {
    return fallback;
  }
}

export const getSolutions = () => fromTable<Entry>('solutions', local.solutions);
export const getGoals = () => fromTable<Entry>('goals', local.goals);
export const getCaseStudies = () => fromTable<Entry>('case_studies', local.caseStudies);
export const getSystems = () => fromTable<Entry>('systems', local.systems);
export const getAutomations = () => fromTable<Entry>('automations', local.automations);
export const getTeam = () => fromTable<Entry>('team', local.team);
export const getTestimonials = () => fromTable('testimonials', local.testimonials);
/**
 * Projects come from the repo, not the database — the one content type that
 * does.
 *
 * A project is not just a row: each one is joined to `public/shots/<slug>.webp`,
 * an entry in `src/data/shots.json` carrying that capture's dimensions and
 * placeholder, and a theme that maps to a hand-built mock frame in
 * `BeforeAfter.tsx`. All of that is versioned with the code, so a row added to
 * the database alone renders a project whose capture does not exist, and a
 * project added to the repo alone stays invisible however many times you
 * deploy — which is exactly what happened to Hollywood Clinics.
 *
 * `generateStaticParams` reads this too, so a repo-only project would not even
 * get a detail route built. Serving the seed keeps the row, the capture and the
 * frame shipping together in one commit.
 *
 * The `projects` table is still defined and seeded in `supabase/`, so it stays
 * usable for anything else that wants it; the site just no longer reads it.
 */
export const getProjects = async () => local.projects;

export const site = local;

export async function findBySlug(list: Promise<Entry[]>, slug: string) {
  return (await list).find((item) => item.slug === slug) ?? null;
}

/** Every entry that has its own page, used to build the "everything is clickable" map. */
export async function allEntries() {
  const [solutions, goals, caseStudies, systems, automations, team] = await Promise.all([
    getSolutions(), getGoals(), getCaseStudies(), getSystems(), getAutomations(), getTeam(),
  ]);
  return { solutions, goals, caseStudies, systems, automations, team };
}
