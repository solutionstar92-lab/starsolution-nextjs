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
 * One before/after comparison — the top of a project card.
 *
 * It used to live in a "Real results" section of its own, below a grid of
 * project cards that already carried the same badge, title and one-liner. The
 * section said everything twice and put the picture a screen away from the
 * words describing it. Now the card is the whole thing.
 *
 * The drag lives on the handle rather than on the whole frame. Grabbing the
 * picture anywhere reads better, but the "after" side is a tall capture of the
 * real storefront that scrolls inside the frame, and a full-bleed drag surface
 * swallows every wheel and swipe aimed at it. The handle is a 44px column, so
 * it is still an easy target, and everywhere else stays free to scroll.
 */
export function Comparison({ project }: { project: Project }) {
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

  /*
   * Touch devices: the capture pans with the page instead of against it.
   *
   * The frame is ~306x204 in the middle of a phone screen and the capture
   * inside it is 4330px tall — 21 screenfuls. A vertical swipe anywhere on the
   * live side was being taken by that scroller, and overscroll chaining could
   * not save it because you would have to swipe twenty-one screens to reach an
   * edge. So the page simply stopped moving under your thumb.
   *
   * Rather than pick a winner, the gesture stops being contested: the scroller
   * is inert on touch (see the CSS) and its position is driven by how far the
   * card has travelled through the viewport. One ordinary page scroll now
   * moves down the page and walks down the storefront at the same time.
   *
   * Pointer-fine devices keep the wheel behaviour they had.
   */
  React.useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (!window.matchMedia('(hover: none)').matches) return;
    const scroller = el.querySelector<HTMLElement>('.rr-after .af-shot-scroll');
    if (!scroller) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const travel = window.innerHeight + r.height;
      if (travel <= 0) return;
      // 0 as the card enters from the bottom, 1 as it leaves past the top.
      const t = Math.max(0, Math.min(1, (window.innerHeight - r.top) / travel));
      // Capped: the full 4330px across one card's travel would be a blur, so a
      // pass shows the top few screenfuls and the project page has the rest.
      const reach = Math.min(scroller.scrollHeight - scroller.clientHeight, scroller.clientHeight * 5);
      scroller.scrollTop = t * reach;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const shot = hasShot(project.slug);
  /* When the site we replaced is still online, `npm run shots` has captured it
     too and the comparison shows the real thing instead of the generic mock. */
  const beforeSlug = `${project.slug}-before`;
  const realBefore = hasShot(beforeSlug);
  return (
    /* .rr-phone is the device shell drawn around the comparison on phones. It
       is display:contents above 640px, so on desktop this element has no box
       and the layout is identical to having no wrapper here. */
    <div className="rr-phone">
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
    </div>
  );
}
