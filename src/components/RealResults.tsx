'use client';

import * as React from 'react';
import { BeforeFrame, AfterFrame, ShotFrame, hasShot } from './BeforeAfter';
import type { Project } from '@/lib/types';

/** Reference behaviour: the divider never reaches the very edge. */
const MIN = 5;
const MAX = 95;
const REST = 35;

const clamp = (n: number) => Math.max(MIN, Math.min(MAX, n));

/**
 * One before/after comparison.
 *
 * The drag lives on the handle rather than on the whole frame. Grabbing the
 * picture anywhere reads better, but the "after" side is a tall capture of the
 * real storefront that scrolls inside the frame, and a full-bleed drag surface
 * swallows every wheel and swipe aimed at it. The handle is a 44px column, so
 * it is still an easy target, and everywhere else stays free to scroll.
 */
function Comparison({ project }: { project: Project }) {
  const [pos, setPos] = React.useState(50);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);
  const swept = React.useRef(false);

  const fromClientX = React.useCallback((clientX: number) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return;
    setPos(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  /* The intro sweep: it runs once, the first time the card scrolls into view,
     and exists to tell you the frame is draggable without any "drag me" label.
     Any real interaction cancels it — see onPointerDown. */
  React.useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      swept.current = true;
      setPos(REST);
      return;
    }

    let frame = 0;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || swept.current) return;
      swept.current = true;
      io.disconnect();

      // 50 → 18 → 82 → 35, eased, so both sides are fully revealed on the way.
      const stops = [50, 18, 82, REST];
      const start = performance.now();
      const dur = 1800;
      const tick = (now: number) => {
        if (dragging.current) return;
        const t = Math.min((now - start) / dur, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        const span = eased * (stops.length - 1);
        const i = Math.min(Math.floor(span), stops.length - 2);
        const local = span - i;
        setPos(stops[i] + (stops[i + 1] - stops[i]) * local);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.35 });

    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') { setPos((p) => clamp(p - step)); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setPos((p) => clamp(p + step)); e.preventDefault(); }
    if (e.key === 'Home') { setPos(MIN); e.preventDefault(); }
    if (e.key === 'End') { setPos(MAX); e.preventDefault(); }
  };

  const shot = hasShot(project.slug);
  /* When the site we replaced is still online, `npm run shots` has captured it
     too and the comparison shows the real thing instead of the generic mock. */
  const beforeSlug = `${project.slug}-before`;
  const realBefore = hasShot(beforeSlug);
  return (
    <figure className="rr-item">
      <div
        ref={boxRef}
        className="rr-slider"
        style={{ ['--pos' as string]: `${pos}%` }}
      >
        <div className="rr-layer rr-after">
          {shot
            ? <ShotFrame slug={project.slug} title={project.title} />
            : <AfterFrame theme={project.theme} />}
        </div>
        <div className="rr-layer rr-before">
          {realBefore
            ? <ShotFrame slug={beforeSlug} title={`${project.title} — previous site`} scroll={false} />
            : <BeforeFrame />}
        </div>
        {shot && <span className="rr-hint" aria-hidden="true">Scroll ↕</span>}
        <span className="rr-label rr-label-before">Before</span>
        <span className="rr-label rr-label-after">After</span>
        <button
          type="button"
          className="rr-handle"
          role="slider"
          aria-label={`Compare ${project.title} before and after`}
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% of the old site shown`}
          onKeyDown={onKeyDown}
          onPointerDown={(e) => {
            swept.current = true;          // a real drag beats the intro sweep
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            e.preventDefault();
          }}
          onPointerMove={(e) => { if (dragging.current) fromClientX(e.clientX); }}
          onPointerUp={(e) => {
            dragging.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => { dragging.current = false; }}
        />
      </div>
      <figcaption className="rr-cap">
        <p className="meta">{project.badge}</p>
        <p className="quote">{project.title}</p>
        <p className="author">{project.short}</p>
        {project.tagline && <p className="rr-tagline">{project.tagline}</p>}
      </figcaption>
    </figure>
  );
}

/**
 * "Real results" — the before/after comparisons as their own section rather
 * than an ornament on a project card, so each one gets the width it needs.
 */
export function RealResults({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;
  return (
    <section className="rr" aria-labelledby="rrTitle">
      <span className="rr-divider" aria-hidden="true" />
      <header className="rr-head">
        <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> Real results</p>
        <h3 id="rrTitle" className="rr-title">Before &amp; After</h3>
        <p className="rr-sub">Drag to see the site we inherited turn into the one we shipped.</p>
      </header>
      <div className="rr-row">
        {projects.map((p) => <Comparison key={p.id} project={p} />)}
      </div>
    </section>
  );
}
