'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from '../Icon';

/** One searchable thing. Built on the server — see buildSearchIndex. */
export interface SearchDoc {
  href: string;
  title: string;
  /** Which part of the site it lives in, shown as a label on the result. */
  group: string;
  /** Extra words to match on, never displayed. */
  terms?: string;
  /** One line under the title. */
  sub?: string;
}

/**
 * Site search.
 *
 * The whole index is a few dozen titles, so it ships with the page and filters
 * in memory — no request per keystroke, no spinner, and it works the instant
 * the panel opens. If the catalogue ever outgrows that, this is the seam to put
 * a query behind.
 *
 * Scoring is deliberately crude but predictable: a title that starts with what
 * you typed beats a title that merely contains it, which beats a match in the
 * hidden terms. People searching a site this size are looking for a page they
 * already know exists, and want it first, not ranked cleverly.
 */
export function SiteSearch({ docs }: { docs: SearchDoc[] }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  const results = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return docs
      .map((d) => {
        const t = d.title.toLowerCase();
        const score = t.startsWith(term) ? 0
          : t.includes(term) ? 1
          : (d.sub ?? '').toLowerCase().includes(term) ? 2
          : (d.terms ?? '').toLowerCase().includes(term) ? 3
          : -1;
        return { d, score };
      })
      .filter((r) => r.score >= 0)
      .sort((a, b) => a.score - b.score || a.d.title.localeCompare(b.d.title))
      .slice(0, 8)
      .map((r) => r.d);
  }, [docs, q]);

  // Reset per opening, and put the caret in the field without the user aiming.
  React.useEffect(() => {
    if (!open) return;
    setQ('');
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [open]);

  // Escape closes from anywhere in the panel; the page behind must not scroll
  // under the overlay on a phone.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  React.useEffect(() => { setActive(0); }, [q]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { setActive((i) => Math.min(i + 1, results.length - 1)); e.preventDefault(); }
    if (e.key === 'ArrowUp') { setActive((i) => Math.max(i - 1, 0)); e.preventDefault(); }
    if (e.key === 'Enter' && results[active]) {
      // Let the anchor do the navigating so middle-click and modifiers behave.
      (document.getElementById(`ss-hit-${active}`) as HTMLAnchorElement | null)?.click();
    }
  };

  return (
    <>
      <button
        type="button"
        className="head-icon"
        aria-label="Search the site"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="search" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ss-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              className="ss-panel"
              initial={reduce ? false : { y: -14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -10, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 0.84, 0.3, 1] }}
              onKeyDown={onKeyDown}
            >
              <div className="ss-field">
                <Icon name="search" />
                <input
                  ref={inputRef}
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search solutions, work, systems…"
                  aria-label="Search the site"
                  autoComplete="off"
                />
                <button type="button" className="ss-close" onClick={() => setOpen(false)} aria-label="Close search">
                  <Icon name="close" />
                </button>
              </div>

              {q.trim() && (
                <ul className="ss-results">
                  {results.length === 0 && <li className="ss-empty">Nothing matches “{q.trim()}”.</li>}
                  {results.map((d, i) => (
                    <li key={d.href}>
                      <Link
                        id={`ss-hit-${i}`}
                        href={d.href}
                        className={`ss-hit${i === active ? ' is-active' : ''}`}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => setOpen(false)}
                      >
                        <span className="ss-hit-main">
                          <strong>{d.title}</strong>
                          {d.sub && <span>{d.sub}</span>}
                        </span>
                        <span className="ss-hit-group">{d.group}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
