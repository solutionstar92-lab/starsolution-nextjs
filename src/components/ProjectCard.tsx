'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import type { Project } from '@/lib/types';

/**
 * A project card that can be read where it stands.
 *
 * The card used to be a teaser: badge, title, one line, and a link off to
 * `/work/<slug>`. That is fine on the portfolio page, where the visitor already
 * chose to browse projects — but on the home page it asked someone who is still
 * deciding whether we are worth their time to leave the pitch to find out what
 * we actually built. So the full write-up (the summary and the "what we did"
 * points that the detail page shows) now expands in place, and the detail page
 * link stays for anyone who wants the before/after comparison too.
 *
 * `heading` exists because the card sits under an `h3` group label on the home
 * page and an `h2` on `/work`; the outline has to stay legal in both.
 */
export function ProjectCard({
  project,
  delay = 0,
  heading = 'h4',
}: {
  project: Project;
  delay?: number;
  /** Heading tag for the project title, matching the surrounding outline. */
  heading?: 'h3' | 'h4';
}) {
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();
  const H = heading;
  const panelId = `live-more-${project.slug}`;

  return (
    <Reveal as="article" className={`live-card${open ? ' is-open' : ''}`} delay={delay}>
      <span className="live-badge">{project.badge}</span>
      <H><Link href={`/work/${project.slug}`}>{project.title}</Link></H>
      <p>{project.short}</p>

      <button
        type="button"
        className="live-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Show less' : 'Read about this project'}
        <Icon name="arrow" className="live-chev" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            className="live-more"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 0.84, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="live-more-inner">
              <p className="live-summary">{project.summary}</p>
              {project.tagline && <p className="live-tagline">{project.tagline}</p>}

              <p className="live-sub">What we did</p>
              <ul className="detail-points">
                {project.points.map((point) => (
                  <li key={point}><Icon name="check" /> {point}</li>
                ))}
              </ul>

              <div className="live-actions">
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="live-link">
                  Visit the live site <Icon name="link" />
                </a>
                <Link className="live-link live-link-muted" href={`/work/${project.slug}`}>
                  See the before &amp; after <Icon name="arrow" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <Link className="live-link" href={`/work/${project.slug}`}>
          View project <Icon name="link" />
        </Link>
      )}
    </Reveal>
  );
}
