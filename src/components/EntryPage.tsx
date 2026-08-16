import Link from 'next/link';
import { Icon } from './Icon';
import { PageHead } from './PageHead';
import { Reveal } from './Reveal';
import type { Entry } from '@/lib/types';

function VideoSlot({ entry }: { entry: Entry }) {
  const v = entry.video;
  if (v === null || v === undefined) return null;
  if (v.youtube) {
    return (
      <div className="detail-video">
        <iframe
          src={`https://www.youtube.com/embed/${v.youtube}`}
          title={`${entry.title} walkthrough`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (v.src) {
    return (
      <div className="detail-video">
        <video src={v.src} poster={v.poster} controls preload="metadata" playsInline />
      </div>
    );
  }
  return (
    <div className="detail-video">
      <div className="video-soon">
        <span className="video-play" aria-hidden="true" />
        <p>Walkthrough video coming soon</p>
      </div>
    </div>
  );
}

export function EntryPage({
  entry, section, sectionHref, prev, next,
  pointsTitle = 'What you get',
  pointsAs = 'list',
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
}) {
  return (
    <>
      <PageHead
        eyebrow={entry.eyebrow}
        title={entry.title}
        lede={entry.summary}
        crumbs={[{ href: '/', label: 'Home' }, { href: sectionHref, label: section }, { label: entry.title }]}
      />

      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="detail-layout">
            <div className="detail-body">
              <Reveal>
                {entry.tagline && <p className="detail-tagline">{entry.tagline}</p>}

                <VideoSlot entry={entry} />

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

              <div className="pager">
                {prev ? (
                  <Link href={`${sectionHref}/${prev.slug}`}>
                    <small>Previous</small><strong>{prev.title}</strong>
                  </Link>
                ) : <span />}
                {next && (
                  <Link href={`${sectionHref}/${next.slug}`} className="pager-next">
                    <small>Next</small><strong>{next.title}</strong>
                  </Link>
                )}
              </div>
            </div>

            <aside className="detail-aside">
              <h2>Start with a free audit</h2>
              <p>We analyze your store, ads and workflows and send back a written growth plan. No commitment.</p>
              <Link href="/contact" className="btn btn-primary btn-lg">Get free audit</Link>
              <a href="https://wa.me/+201234567890" className="btn btn-ghost btn-lg mt-2 w-full">
                <Icon name="whatsapp" className="h-5 w-5 text-[#25D366]" /> WhatsApp
              </a>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
