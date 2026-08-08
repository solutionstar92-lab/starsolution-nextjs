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
export const getProjects = () => fromTable('projects', local.projects);

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
