'use client';

import * as React from 'react';
import { Icon } from './Icon';

const BEAUTY_TILES = [
  { src: 'https://beauty-bareg.net/cdn/shop/files/chanel-25-large-handbag-washed-denim-and-gold-tone-metal-1472295.webp?v=1784429243&width=200', brand: 'Chanel', price: 'LE 8,500' },
  { src: 'https://beauty-bareg.net/cdn/shop/files/miu-miu-crochet-tote-bag-6879459.png?v=1784240650&width=200', brand: 'Miu Miu', price: 'LE 6,500' },
  { src: 'https://beauty-bareg.net/cdn/shop/files/louis-vuitton-handbag-speedy-bandouliere-30-in-signature-monogram-7976038.jpg?v=1783956736&width=200', brand: 'Louis Vuitton', price: 'LE 7,500' },
  { src: 'https://beauty-bareg.net/cdn/shop/files/valentino-garavani-viva-superstar-large-raffia-shopping-bag-natural-2149193.png?v=1784141530&width=200', brand: 'Valentino', price: 'LE 7,500' },
];

function BeforeFrame() {
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

function AfterFrame({ theme }: { theme: 'montre' | 'beauty' }) {
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

/** Draggable before/after comparison. The clipped layer keeps the frame's full width. */
export function BeforeAfter({ theme, label }: { theme: 'montre' | 'beauty'; label: string }) {
  const [pos, setPos] = React.useState(50);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const measure = () => setWidth(boxRef.current?.clientWidth ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div className="ba" ref={boxRef} style={{ ['--pos' as string]: `${pos}%` }}>
      <AfterFrame theme={theme} />
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
