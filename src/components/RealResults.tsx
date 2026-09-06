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
    /* Both sides, not just the live one. The old site is a capture of the same
       kind, and walking only one of them down the page put the two halves of
       the comparison at different depths as you scrolled. */
    const panes = Array.from(el.querySelectorAll<HTMLElement>('.rr-layer .af-shot-scroll'))
      .map((scroller) => ({ scroller, img: scroller.querySelector<HTMLElement>('img') }))
      .filter((p): p is { scroller: HTMLElement; img: HTMLElement } => !!p.img);
    if (!panes.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* Moved with a transform rather than by setting scrollTop.
       Both look identical, but scrolling a box whose content is a 4330px image
       repaints it every frame, and profiling the section on a 4x-throttled
       phone put a third of the frame budget in that one write. A translate on
       the image is a compositor move: same picture, no repaint. The scroller is
       already overflow:hidden here (see the CSS), so nothing else changes. */
    panes.forEach((p) => { p.scroller.scrollTop = 0; });

    let raf = 0;
    let lastT = -1;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const travel = window.innerHeight + r.height;
      if (travel <= 0) return;
      // 0 as the card enters from the bottom, 1 as it leaves past the top.
      const t = Math.max(0, Math.min(1, (window.innerHeight - r.top) / travel));
      if (t === lastT) return;   // a scroll that did not move this card is free
      lastT = t;

      /* One fraction, applied to both — the same rule the wheel path uses.
         Driving them by a shared number of pixels instead would put the two
         sites at different depths, because the old store is a shorter page: the
         same 400px is a fifth of the way down one and nearly half the other.
         The fraction is capped so the taller capture still travels only about
         five screenfuls in a pass; the whole 4330px in one go would be a blur,
         and the project page has the rest. */
      const spans = panes.map(({ scroller, img }) => Math.max(0, img.offsetHeight - scroller.clientHeight));
      let cap = 1;
      panes.forEach(({ scroller }, i) => {
        if (spans[i] > 0) cap = Math.min(cap, (scroller.clientHeight * 5) / spans[i]);
      });
      const f = t * cap;
      panes.forEach(({ img }, i) => {
        img.style.transform = `translate3d(0, ${-Math.round(f * spans[i])}px, 0)`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      panes.forEach((p) => { p.img.style.transform = ''; });
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /*
   * Pointer-fine devices: the wheel still scrolls a capture, and now there are
   * two of them. Scrolling either one carries the other to the same relative
   * depth, so the divider always cuts one moment of the page rather than the
   * old site's header against the new site's footer. Proportional rather than
   * pixel-for-pixel — the two captures are different heights, and both sides
   * should reach their end together.
   */
  React.useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (window.matchMedia('(hover: none)').matches) return;   // touch is driven by the page
    const panes = Array.from(el.querySelectorAll<HTMLElement>('.rr-layer .af-shot-scroll'));
    if (panes.length < 2) return;

    let echo = false;   // the sync writes scrollTop, which fires scroll again
    const onScroll = (e: Event) => {
      if (echo) return;
      const src = e.currentTarget as HTMLElement;
      const srcMax = src.scrollHeight - src.clientHeight;
      if (srcMax <= 0) return;
      const ratio = src.scrollTop / srcMax;
      echo = true;
      for (const other of panes) {
        if (other === src) continue;
        const max = other.scrollHeight - other.clientHeight;
        if (max > 0) other.scrollTop = ratio * max;
      }
      requestAnimationFrame(() => { echo = false; });
    };

    panes.forEach((p) => p.addEventListener('scroll', onScroll, { passive: true }));
    return () => panes.forEach((p) => p.removeEventListener('scroll', onScroll));
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
            ? <ShotFrame
                slug={beforeSlug}
                title={`${project.title} — previous site`}
                scrollLabel="scroll the previous site"
              />
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
