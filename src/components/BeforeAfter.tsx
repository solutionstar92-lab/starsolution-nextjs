'use client';

import * as React from 'react';
import { Icon } from './Icon';
import shots from '@/data/shots.json';
import type { ProjectTheme } from '@/lib/types';

/** One entry in `src/data/shots.json`, written by `npm run shots`. */
type Shot = { width: number; height: number; lqip?: string };

const BEAUTY_TILES = [
  { src: 'https://beauty-bareg.net/cdn/shop/files/chanel-25-large-handbag-washed-denim-and-gold-tone-metal-1472295.webp?v=1784429243&width=200', brand: 'Chanel', price: 'LE 8,500' },
  { src: 'https://beauty-bareg.net/cdn/shop/files/miu-miu-crochet-tote-bag-6879459.png?v=1784240650&width=200', brand: 'Miu Miu', price: 'LE 6,500' },
  { src: 'https://beauty-bareg.net/cdn/shop/files/louis-vuitton-handbag-speedy-bandouliere-30-in-signature-monogram-7976038.jpg?v=1783956736&width=200', brand: 'Louis Vuitton', price: 'LE 7,500' },
  { src: 'https://beauty-bareg.net/cdn/shop/files/valentino-garavani-viva-superstar-large-raffia-shopping-bag-natural-2149193.png?v=1784141530&width=200', brand: 'Valentino', price: 'LE 7,500' },
];

export function BeforeFrame() {
  return (
    <div className="ba-frame bf">
      <div className="bf-banner">★★★ WELCOME TO OUR WEBSITE ★★★</div>
      <div className="bf-nav">Home | Products | About | Contact | Sitemap</div>
      <div className="bf-body">
        <div className="bf-col">
          <div className="bf-img" />
          <p className="bf-red">SPECIAL OFFER!!! CLICK HERE NOW</p>
          <p className="bf-txt">
            Welcome to our online shop. We sell many products for cheap price. Please contact us on
            phone for order and delivery information thank you.
          </p>
          <span className="bf-btn">BUY NOW!!!</span>
        </div>
        <div className="bf-grid">
          <span /><span /><span /><span /><span /><span />
        </div>
      </div>
      <div className="bf-foot">Best viewed in 1024x768 · Copyright 2014</div>
    </div>
  );
}

/**
 * The finished site, as a full-page capture you can scroll inside the frame.
 *
 * Not an <iframe>: both storefronts send `x-frame-options: DENY` and
 * `frame-ancestors 'none'`, so a browser refuses to embed them. `npm run shots`
 * captures the pages instead — re-run it after a store redesign.
 */
export function ShotFrame({
  slug, title, scroll = true,
}: {
  slug: string; title: string;
  /** The "before" capture is a clipped sliver — two scrollers in one frame
   *  reads as a bug, so only the live side takes the wheel. */
  scroll?: boolean;
}) {
  const shot = (shots as Record<string, Shot>)[slug];
  return (
    <div className={`ba-frame af-shot${scroll ? '' : ' af-shot-fixed'}`}>
      <div
        className="af-shot-scroll"
        {...(scroll ? { tabIndex: 0, role: 'group', 'aria-label': `${title} — scroll the live site` } : {})}
      >
        {/* plain <img>: a pre-sized static capture, next/image adds nothing here.
            The 24px stand-in from the manifest sits behind it as a background,
            so the frame shows the shape of the page from the first paint
            instead of a white panel until the capture downloads. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/shots/${slug}.webp`}
          alt={`${title} storefront`}
          width={shot?.width}
          height={shot?.height}
          loading="lazy"
          decoding="async"
          style={shot?.lqip ? { backgroundImage: `url(${shot.lqip})` } : undefined}
        />
      </div>
      {scroll && <span className="af-shot-hint" aria-hidden="true">Scroll ↕</span>}
    </div>
  );
}

export function AfterFrame({ theme }: { theme: ProjectTheme }) {
  if (theme === 'beauty') {
    return (
      <div className="ba-frame af af-beauty">
        <div className="af-promo">✦ SUMMER COLLECTION — 2026 ✦</div>
        <div className="af-nav">
          <span className="af-logo">Beauty<i>Bar</i></span>
          <span className="af-links">BAGS · FOOTWEAR · PERFUMES</span>
        </div>
        <div className="af-hero">
          <span className="af-kicker">SUMMER PICKS</span>
          <span className="af-title">SAHEL <i>Essentials</i></span>
          <span className="af-pill">UP TO 70% OFF</span>
        </div>
        <div className="af-grid">
          {BEAUTY_TILES.map((t) => (
            <figure className="af-tile" key={t.brand}>
              {/* plain <img>: these are remote CDN assets from the live store */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.src} alt={`${t.brand} bag`} loading="lazy" decoding="async" />
              <figcaption><b>{t.brand}</b><span>{t.price}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    );
  }

  if (theme === 'clinic') {
    const cards = [
      { cls: '', name: 'Dental', meta: 'Implants · Veneers' },
      { cls: ' af-doc-2', name: 'Dermatology', meta: 'Laser · Peels' },
      { cls: ' af-doc-3', name: 'Aesthetics', meta: 'Fillers · Botox' },
      { cls: ' af-doc-4', name: 'Nutrition', meta: 'Plans · Follow-up' },
    ];
    return (
      <div className="ba-frame af af-clinic">
        <div className="af-promo">BOOK ONLINE · SAME-DAY APPOINTMENTS</div>
        <div className="af-nav">
          <span className="af-logo">Hollywood<i>Clinics</i></span>
          <span className="af-links">SERVICES · DOCTORS · العربية</span>
        </div>
        <div className="af-hero">
          <span className="af-kicker">MULTI-SPECIALTY CARE</span>
          <span className="af-title">Book in <i>three taps</i></span>
          <span className="af-pill">BOOK APPOINTMENT</span>
        </div>
        <div className="af-grid">
          {cards.map((c) => (
            <figure className="af-tile af-mock" key={c.name}>
              <span className={`af-doc${c.cls}`} />
              <figcaption><b>{c.name}</b><span>{c.meta}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    );
  }

  const watches = [
    { cls: '', name: 'Automatic', size: '42 mm' },
    { cls: ' af-watch-2', name: 'Chronograph', size: '40 mm' },
    { cls: ' af-watch-3', name: 'Diver', size: '44 mm' },
    { cls: ' af-watch-4', name: 'Dress', size: '38 mm' },
  ];
  return (
    <div className="ba-frame af af-montre">
      <div className="af-promo">FREE DELIVERY ON EVERY ORDER</div>
      <div className="af-nav">
        <span className="af-logo">Montre<i>Co.</i></span>
        <span className="af-links">NEW IN · AUTOMATIC · STRAPS</span>
      </div>
      <div className="af-hero">
        <span className="af-kicker">THE 2026 EDIT</span>
        <span className="af-title">Timeless <i>Precision</i></span>
        <span className="af-pill">SHOP NOW</span>
      </div>
      <div className="af-grid">
        {watches.map((w) => (
          <figure className="af-tile af-mock" key={w.name}>
            <span className={`af-watch${w.cls}`} />
            <figcaption><b>{w.name}</b><span>{w.size}</span></figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/**
 * Draggable before/after comparison. The clipped layer keeps the frame's full width.
 *
 * When a capture exists for `slug` the "after" side is the real storefront and
 * scrolls inside the frame, so the drag control is confined to a strip along the
 * bottom — a full-bleed range input would swallow every scroll gesture.
 */
/** True when `npm run shots` has captured this storefront. */
export const hasShot = (slug?: string) => Boolean(slug && slug in shots);

export function BeforeAfter({
  theme, label, slug, title,
}: {
  theme: ProjectTheme;
  label: string;
  slug?: string;
  title?: string;
}) {
  const [pos, setPos] = React.useState(50);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);

  const shotReady = hasShot(slug);

  React.useEffect(() => {
    const measure = () => setWidth(boxRef.current?.clientWidth ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div
      className={`ba${shotReady ? ' ba-live' : ''}`}
      ref={boxRef}
      style={{ ['--pos' as string]: `${pos}%` }}
    >
      {shotReady
        ? <ShotFrame slug={slug as string} title={title ?? 'Live site'} />
        : <AfterFrame theme={theme} />}
      <div className="ba-clip">
        <div style={{ width: width ? `${width}px` : '100%', height: '100%' }}>
          <BeforeFrame />
        </div>
      </div>
      <span className="ba-tag ba-tag-before">Before</span>
      <span className="ba-tag ba-tag-after">After · live now</span>
      <span className="ba-handle" aria-hidden="true"><Icon name="left" /><Icon name="right" /></span>
      <input
        type="range" className="ba-range" min={0} max={100} value={pos}
        aria-label={label}
        onChange={(e) => setPos(Number(e.target.value))}
      />
    </div>
  );
}
