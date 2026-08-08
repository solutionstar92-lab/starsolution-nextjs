'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import * as React from 'react';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import type { HeroNode } from '@/lib/types';

/** Keeps the H1 on exactly one line whatever font ends up loading. */
function useHeadlineFit(ref: React.RefObject<HTMLHeadingElement>) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const fit = () => {
      const parent = el.parentElement;
      if (!parent || !parent.clientWidth) return;
      el.style.fontSize = '100px';
      const natural = el.scrollWidth;
      if (!natural) return;
      const size = Math.min(64, Math.floor((parent.clientWidth / natural) * 100));
      el.style.fontSize = `${Math.max(14, size)}px`;
    };
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
    schedule();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    document.fonts?.ready.then(schedule);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', schedule); window.removeEventListener('orientationchange', schedule); };
  }, [ref]);
}

const NET_LINES = [
  '60,470 190,392 268,470 402,344 520,404 640,300',
  '190,392 240,236 372,180 520,222 640,300 760,180',
  '640,300 742,438 880,470 1010,376 1140,436',
  '760,180 900,132 1040,196 1140,120',
  '268,470 320,600 470,632 610,560',
  '880,470 940,596 1080,628',
];
const NET_DOTS: [number, number, number][] = [
  [190, 392, 3], [268, 470, 2.4], [402, 344, 2.4], [520, 222, 3], [640, 300, 3.4],
  [760, 180, 2.6], [880, 470, 3], [1010, 376, 2.4], [240, 236, 2.6], [900, 132, 2.4],
  [470, 632, 2.6], [1080, 628, 2.4],
];

export function Hero({ nodes, stats, platforms }: { nodes: HeroNode[]; stats: [string, string, string][]; platforms: string[] }) {
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  useHeadlineFit(titleRef);
  const reduce = useReducedMotion();

  const heroRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const washRef = React.useRef<HTMLDivElement>(null);

  /* pointer parallax — fine pointers only */
  React.useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const hero = heroRef.current;
    if (!hero) return;
    let px = 0, py = 0, ticking = false;
    const apply = () => {
      if (stageRef.current) stageRef.current.style.transform = `translate3d(${px * 12}px, ${py * 10}px, 0)`;
      if (washRef.current) washRef.current.style.transform = `translate3d(${px * -18}px, ${py * -14}px, 0)`;
      ticking = false;
    };
    const move = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    };
    const leave = () => { px = 0; py = 0; requestAnimationFrame(apply); };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    return () => { hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); };
  }, [reduce]);

  const stars = React.useMemo(
    () => Array.from({ length: 46 }, (_, i) => ({
      left: `${((i * 37.7) % 100).toFixed(2)}%`,
      top: `${((i * 61.3) % 100).toFixed(2)}%`,
      size: `${(1 + ((i * 13) % 22) / 10).toFixed(2)}px`,
      o: (0.18 + ((i * 7) % 40) / 100).toFixed(2),
      tw: `${(3.5 + ((i * 11) % 50) / 10).toFixed(1)}s`,
      delay: `-${((i * 17) % 60) / 10}s`,
    })),
    [],
  );

  return (
    <section className="hero" aria-labelledby="heroTitle" ref={heroRef}>
      <div className="hero-wash" aria-hidden="true" ref={washRef} />
      <div className="starfield" aria-hidden="true">
        {stars.map((s, i) => (
          <span key={i} className="star" style={{ left: s.left, top: s.top, width: s.size, height: s.size, ['--o' as string]: s.o, ['--tw' as string]: s.tw, animationDelay: s.delay }} />
        ))}
      </div>

      <svg className="hero-net" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g className="net-lines">{NET_LINES.map((p, i) => <polyline key={i} points={p} />)}</g>
        <g className="net-dots">{NET_DOTS.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}</g>
      </svg>

      <div className="hero-shell">
        <div className="hero-copy">
          <Reveal as="div">
            <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> AI automation for e-commerce brands</p>
          </Reveal>
          <motion.h1
            id="heroTitle"
            className="hero-title"
            ref={titleRef}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 0.84, 0.3, 1] }}
          >
            More orders. More revenue. <span className="grad-text">Less work.</span>
          </motion.h1>
        </div>

        <Reveal className="hero-visual">
          <div className="agent-stage" id="agentStage" ref={stageRef}>
            <div className="agent-aura" aria-hidden="true" />

            <svg className="agent-links" viewBox="0 0 640 520" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#3B82F6" /><stop offset="1" stopColor="#7C6CFF" />
                </linearGradient>
              </defs>
              <g className="link-base">
                <path d="M266 230C248 196 238 156 218 122" />
                <path d="M266 290C248 324 238 364 218 398" />
                <path d="M374 230C392 196 402 156 422 122" />
                <path d="M374 290C392 324 402 364 422 398" />
              </g>
              <path className="flow flow-1" d="M266 230C248 196 238 156 218 122" />
              <path className="flow flow-2" d="M266 290C248 324 238 364 218 398" />
              <path className="flow flow-3" d="M374 230C392 196 402 156 422 122" />
              <path className="flow flow-4" d="M374 290C392 324 402 364 422 398" />
              <g className="link-nodes">
                <circle cx="218" cy="122" r="4.5" /><circle cx="218" cy="398" r="4.5" />
                <circle cx="422" cy="122" r="4.5" /><circle cx="422" cy="398" r="4.5" />
              </g>
            </svg>

            <div className="agent-core">
              <span className="agent-pulse" aria-hidden="true" />
              <span className="agent-ring" aria-hidden="true" />
              <span className="agent-orb"><Icon name="bot" className="agent-orb-icon" /></span>
              <span className="agent-name">AI Agent</span>
            </div>

            <div className="agent-nodes">
              {nodes.map((n, i) => (
                <article className={`node node-${i + 1}`} key={n.source}>
                  <header>
                    <span className="node-icon" style={{ ['--n' as string]: n.tone }}><Icon name={n.icon} /></span> {n.source}
                  </header>
                  <p className="node-label">{n.label}</p>
                  <p className="node-value">{n.value}</p>
                  <p className="node-delta">{n.delta}</p>
                  <svg className="node-spark" viewBox="0 0 90 24" aria-hidden="true"><polyline points={n.spark} /></svg>
                </article>
              ))}
            </div>
          </div>

          <p className="orbit-hint">Live client dashboard</p>
        </Reveal>

        <Reveal className="hero-actions" delay={0.1}>
          <Link href="/contact" className="btn btn-primary btn-lg">
            Get free growth plan <Icon name="arrow" className="h-[18px] w-[18px]" />
          </Link>
          <Link href="/results" className="btn btn-ghost btn-lg">See results</Link>
        </Reveal>

        <Reveal as="dl" className="hero-proof" delay={0.16}>
          {stats.map(([label, value, unit]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}{unit && <span>{unit}</span>}</dd>
            </div>
          ))}
        </Reveal>

        <Reveal className="hero-logos" delay={0.22}>
          <p className="logo-label">Platforms we automate</p>
          <ul className="logo-row">{platforms.map((p) => <li key={p}>{p}</li>)}</ul>
        </Reveal>
      </div>
    </section>
  );
}
