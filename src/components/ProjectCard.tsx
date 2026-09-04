'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { Comparison } from './RealResults';
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
 * The before/after comparison sits at the top of the card. It used to be a
 * separate "Real results" section underneath, which repeated this card's badge,
 * title and one-liner verbatim under every slider — the same project written
 * out twice, with the picture a screen away from the words.
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
      <Comparison project={project} />
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

              {/* "See the before & after" used to live here; the comparison is
                  now at the top of this card, so the link went to the one thing
                  the detail page still adds. */}
              <div className="live-actions">
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="live-link">
                  Visit the live site <Icon name="link" />
                </a>
                <Link className="live-link live-link-muted" href={`/work/${project.slug}`}>
                  Full project page <Icon name="arrow" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The closed card used to carry "View project" as well as the toggle
          above it — two links, a gap between them, both leading to the same
          write-up. The toggle opens it in place; the title is still a link to
          the detail page for anyone who wants the route. */}
    </Reveal>
  );
}
