'use client';

import * as React from 'react';
import { Icon } from './Icon';

/**
 * Horizontal snapping rail with arrows and position dots.
 * Dot tracking reads the rail's own scroll-snap-align, because the case and
 * review rails snap to card centres while others snap to the leading edge.
 */
export function Rail({
  id,
  label,
  children,
  showDots = true,
  className = '',
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  showDots?: boolean;
  className?: string;
}) {
  const railRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [edges, setEdges] = React.useState({ start: true, end: false });

  const cards = React.useCallback(
    () => Array.from(railRef.current?.querySelectorAll<HTMLElement>('.rail-inner > *') ?? []),
    [],
  );

  const sync = React.useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const list = cards();
    setCount(list.length);
    if (!list.length) return;

    const snapStart = (getComputedStyle(list[0]).scrollSnapAlign || '').indexOf('start') === 0;
    const pad = parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
    const ref = snapStart ? rail.scrollLeft + pad : rail.scrollLeft + rail.clientWidth / 2;

    let best = 0;
    let bestDist = Infinity;
    list.forEach((card, i) => {
      const offset = card.offsetLeft - rail.offsetLeft;
      const c = snapStart ? offset : offset + card.offsetWidth / 2;
      const d = Math.abs(c - ref);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setActive(best);
    setEdges({
      start: rail.scrollLeft <= 2,
      end: rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2,
    });
  }, [cards]);

  React.useEffect(() => {
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [sync]);

  const nudge = (dir: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const first = cards()[0];
    const step = first ? first.getBoundingClientRect().width + 20 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: step * dir, behavior: 'smooth' });
  };

  const goTo = (i: number) => {
    const rail = railRef.current;
    const card = cards()[i];
    if (!rail || !card) return;
    rail.scrollTo({ left: card.offsetLeft - rail.offsetLeft, behavior: 'smooth' });
  };

  return (
    <>
      <div className="slider-nav" role="group" aria-label={`${label} navigation`}>
        <button type="button" className="round-btn" onClick={() => nudge(-1)} disabled={edges.start} aria-label={`Previous ${label}`}>
          <Icon name="left" />
        </button>
        <button type="button" className="round-btn" onClick={() => nudge(1)} disabled={edges.end} aria-label={`Next ${label}`}>
          <Icon name="right" />
        </button>
      </div>

      <div
        className={`rail ${className}`}
        id={id}
        ref={railRef}
        onScroll={sync}
        tabIndex={0}
        role="region"
        aria-label={`${label}, scrollable`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1); }
        }}
      >
        <div className="rail-inner">{children}</div>
      </div>

      {showDots && count > 1 && (
        <div className="rail-dots" role="tablist" aria-label={`${label} position`}>
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to item ${i + 1} of ${count}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </>
  );
}
