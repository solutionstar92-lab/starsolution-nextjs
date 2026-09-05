import { allEntries, getProjects, site } from '@/lib/content';
import type { SearchDoc } from './SiteSearch';

/** The fixed pages, which have no rows behind them. */
const PAGES: SearchDoc[] = [
  { href: '/', title: 'Home', group: 'Page', terms: 'start homepage overview' },
  { href: '/solutions', title: 'Solutions', group: 'Page', terms: 'services what we do suite' },
  { href: '/results', title: 'Results', group: 'Page', terms: 'numbers proof stats roas revenue' },
  { href: '/process', title: 'How it works', group: 'Page', terms: 'process steps onboarding timeline' },
  { href: '/work', title: 'Our work', group: 'Page', terms: 'portfolio projects websites builds' },
  { href: '/case-studies', title: 'Case studies', group: 'Page', terms: 'clients stories before after' },
  { href: '/systems', title: 'Systems', group: 'Page', terms: 'dashboards internal tools' },
  { href: '/automations', title: 'Automations', group: 'Page', terms: 'ai integrations workflows n8n' },
  { href: '/goals', title: 'Goals', group: 'Page', terms: 'objectives outcomes' },
  { href: '/team', title: 'Team', group: 'Page', terms: 'people about us staff' },
  { href: '/blog', title: 'Blog', group: 'Page', terms: 'articles writing insights' },
  { href: '/about', title: 'About', group: 'Page', terms: 'company who we are' },
  { href: '/contact', title: 'Contact', group: 'Page', terms: 'get in touch audit email phone whatsapp' },
];

/**
 * Everything the header search can find.
 *
 * Built on the server and handed to the client as a prop: it is a few dozen
 * titles, so shipping it costs less than the round trip a query would need, and
 * the panel filters with no network at all.
 *
 * It reads the same getters the pages do, so an entry hidden from the site is
 * hidden from search too — visible() has already run by the time these return.
 * A result pointing at a 404 is worse than no result.
 */
export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const [{ solutions, goals, caseStudies, systems, automations, team }, projects] =
    await Promise.all([allEntries(), getProjects()]);

  const from = (rows: { slug: string; title: string; short?: string; summary?: string }[], base: string, group: string) =>
    rows.map((r) => ({
      href: `${base}/${r.slug}`,
      title: r.title,
      group,
      sub: r.short ?? r.summary,
    }));

  return [
    ...PAGES,
    ...from(solutions, '/solutions', 'Solution'),
    ...from(goals, '/goals', 'Goal'),
    ...from(systems, '/systems', 'System'),
    ...from(automations, '/automations', 'Automation'),
    ...from(caseStudies, '/case-studies', 'Case study'),
    ...from(team, '/team', 'Team'),
    ...projects.map((p) => ({
      href: `/work/${p.slug}`,
      title: p.title,
      group: 'Project',
      sub: p.short,
      terms: p.badge,
    })),
    ...site.platforms.map((name) => ({
      // Platform names are what people actually type — "shopify", "whatsapp" —
      // and the automations page is where those live.
      href: '/automations',
      title: name,
      group: 'Platform',
      sub: 'Automations we build on it',
      terms: 'platform integration tool',
    })),
  ];
}
