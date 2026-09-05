import Link from 'next/link';
import { Icon } from '../Icon';
import type { Entry } from '@/lib/types';

/**
 * Look and colour for a system, derived from its tag.
 *
 * The `systems` table has no icon or tone column, and the rows come from
 * Supabase with the seed only as a fallback — so adding the fields to
 * site.json would change nothing on a configured site. Deriving them here
 * means the cards are dressed today, and the moment the columns do exist the
 * row's own values win: see the ?? below.
 *
 * Keyed on the tag rather than the array index, which is what autoTone() does
 * for automations and is a guess that only holds while the order does. A tag is
 * what the system *is*, so reordering or inserting cannot scramble it.
 */
const BY_TAG: Record<string, { icon: string; tone: string }> = {
  finance: { icon: 'revenue', tone: '#34D399' },
  'ai + seo': { icon: 'search', tone: '#7C6CFF' },
  logistics: { icon: 'package', tone: '#FBBF24' },
  analytics: { icon: 'chart', tone: '#3B82F6' },
  support: { icon: 'headset', tone: '#38BDF8' },
  marketing: { icon: 'social', tone: '#F472B6' },
};

/** Anything unmapped still gets a colour, just not a meaningful one. */
const FALLBACK = ['#3B82F6', '#7C6CFF', '#34D399', '#FBBF24', '#38BDF8', '#F472B6'];

export function systemLook(system: Entry, index = 0) {
  const byTag = BY_TAG[(system.tag ?? '').trim().toLowerCase()];
  return {
    icon: system.icon ?? byTag?.icon ?? 'build',
    tone: system.tone ?? byTag?.tone ?? FALLBACK[index % FALLBACK.length],
  };
}

/**
 * One system, as a row in a list.
 *
 * A list rather than a grid of cards: four systems described in a line each is
 * a list of things, and boxing every one of them spends a border, a shadow and
 * two lots of padding to say so. The row keeps what the card was carrying — the
 * tone, the icon, the tag — and drops the box around it.
 *
 * Shared by the home page section and /work rather than written twice; the only
 * difference that matters is the heading level, which each page's outline
 * decides.
 */
export function SystemCard({
  system, index = 0, heading = 'h3',
}: {
  system: Entry;
  index?: number;
  /** Matches the surrounding outline: h3 under a section h2, h4 under an h3. */
  heading?: 'h3' | 'h4';
}) {
  const { icon, tone } = systemLook(system, index);
  const H = heading;

  return (
    <Link
      href={`/systems/${system.slug}`}
      className="system-row"
      style={{ ['--tone' as string]: tone }}
    >
      <span className="sys-icon"><Icon name={icon} /></span>
      <span className="sys-body">
        <H>{system.title}</H>
        <p className="sys-short">{system.short}</p>
      </span>
      <span className="sys-tag">{system.tag}</span>
      <span className="sys-go" aria-hidden="true"><Icon name="arrow" /></span>
    </Link>
  );
}
