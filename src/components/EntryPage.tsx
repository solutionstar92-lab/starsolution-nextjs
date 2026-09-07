import Link from 'next/link';
import { Icon } from './Icon';
import { PageHead } from './PageHead';
import { Reveal } from './Reveal';
import { site } from '@/lib/content';
import type { Entry } from '@/lib/types';

export function EntryPage({
  entry, section, sectionHref, prev, next,
  pointsTitle = 'What you get',
  pointsAs = 'list',
  icon,
  tone,
}: {
  entry: Entry;
  section: string;
  sectionHref: string;
  prev?: Entry | null;
  next?: Entry | null;
  /** Heading above `points`. "What you get" suits a service; a person needs its own word. */
  pointsTitle?: string;
  /** Short labels read better as chips than as a checklist. */
  pointsAs?: 'list' | 'chips';
  /** Override the entry's own mark — the automations list colours its cards by
   *  position rather than from the row, so the page has to be told to match. */
  icon?: string;
  tone?: string;
}) {
  const mark = icon ?? entry.icon;
  const hue = tone ?? entry.tone;
  /* Everything else in this section, for the aside. On a desktop the sticky CTA
     card left most of a screen of empty column beside the body; somewhere to go
     next is more use there than white space, and it links the section together. */
  const more = [next, prev].filter((e): e is Entry => !!e);

  return (
    <>
      <PageHead
        eyebrow={entry.eyebrow}
        title={entry.title}
        lede={entry.summary}
        icon={mark}
        tone={hue}
        crumbs={[{ href: '/', label: 'Home' }, { href: sectionHref, label: section }, { label: entry.title }]}
      />

      <section className="section" style={hue ? ({ ['--tone' as string]: hue }) : undefined}>
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="detail-layout">
            <div className="detail-body">
              <Reveal>
                {entry.tagline && <p className="detail-tagline">{entry.tagline}</p>}

                {entry.stats && entry.stats.length > 0 && (
                  <dl className="detail-stats">
                    {entry.stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                  </dl>
                )}

                {entry.points && entry.points.length > 0 && (
                  <>
                    <h2>{pointsTitle}</h2>
                    {pointsAs === 'chips' ? (
                      <ul className="chip-row chip-row-static">
                        {entry.points.map((p) => <li key={p}>{p}</li>)}
                      </ul>
                    ) : (
                      <ul className="detail-points">
                        {entry.points.map((p) => <li key={p}><Icon name="check" /> {p}</li>)}
                      </ul>
                    )}
                  </>
                )}
              </Reveal>

              {/* The prev/next pager used to sit here. It listed the same two
                  entries the "More in ..." panel now lists, and with one
                  neighbour it rendered as a single card floated against the
                  right edge with nothing beside it. One of the two had to go,
                  and the panel is the one that also fills the empty column. */}
            </div>

            <div className="detail-rail">
              <aside className="detail-aside">
                <h2>Start with a free audit</h2>
                <p>We analyze your store, ads and workflows and send back a written growth plan. No commitment.</p>
                <Link href="/contact" className="btn btn-primary btn-lg">Get free audit</Link>
                <a href={site.contact.whatsapp} className="btn btn-ghost btn-lg mt-2 w-full">
                  <Icon name="whatsapp" className="h-5 w-5 text-[#25D366]" /> WhatsApp
                </a>
              </aside>

              {more.length > 0 && (
                <nav className="aside-more" aria-label={`More in ${section}`}>
                  <p className="aside-more-h">More in {section.toLowerCase()}</p>
                  <ul>
                    {more.map((e) => (
                      <li key={e.slug}>
                        <Link href={`${sectionHref}/${e.slug}`}>
                          <span>{e.title}</span>
                          <Icon name="arrow" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={sectionHref} className="aside-more-all">
                    All {section.toLowerCase()} <Icon name="arrow" />
                  </Link>
                </nav>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
