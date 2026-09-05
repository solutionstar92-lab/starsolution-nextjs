'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { LogoStatic } from './LogoStatic';
import {
  LOGO_COLORS,
  LOGO_NODES,
  LOGO_PATH,
  LOGO_STARFIELD,
  LOGO_STAR_CENTER,
  LOGO_STAR_PATH,
  logoMetrics,
  wordColor,
  type LogoBaseProps,
} from './logo-shape';

export interface LogoAnimatedProps extends LogoBaseProps {
  /** Replay the draw-in when the pointer enters. Default true. */
  replayOnHover?: boolean;
  /** Seconds before the draw starts. Useful for staggering a splash. */
  delay?: number;
  /** Seconds the constellation takes to draw itself. Default 1.5. */
  duration?: number;
}

const EASE = [0.16, 0.84, 0.3, 1] as const;

/**
 * The Star Solution logo, drawing itself.
 *
 * Four motions, each on its own clock so they read as one object rather than a
 * synchronised routine: the line draws from the top terminal to the bottom one,
 * each node fades up as the line reaches it, the centre star turns and
 * twinkles, and the words rise into place behind it.
 *
 * None of the animated SVG children set `transform-box`. Framer already
 * writes `transform-origin` in user-space units (the element's own centre in
 * viewBox coordinates), which is what the default `view-box` expects; adding
 * `fill-box` re-anchors those numbers to the bounding box corner and throws
 * the shape across the canvas. It showed up as the glow star sitting below the
 * constellation, because its rotation never returns to identity — the nodes had
 * it too, and only hid it by ending each pulse back at scale 1.
 *
 * On `prefers-reduced-motion` this returns LogoStatic outright. Not a shortened
 * animation and not a paused one — the same component the rest of the site
 * uses, so there is exactly one still logo to keep correct. Sequential drawing
 * and pulsing dots are precisely the vestibular triggers that setting exists
 * for, and the mark carries no information the motion adds.
 */
export function LogoAnimated({
  size = 40,
  width,
  height,
  variant = 'auto',
  layout = 'lockup',
  showTagline,
  className,
  label = 'Star Solution',
  replayOnHover = true,
  delay = 0,
  duration = 1.5,
}: LogoAnimatedProps) {
  const reduce = useReducedMotion();
  const uid = React.useId().replace(/:/g, '');
  // Bumping this remounts the drawn path, which is the cheapest honest way to
  // restart a mount animation — controls would have to unwind the current one.
  const [run, setRun] = React.useState(0);

  const m = logoMetrics(size);
  const markOnly = layout === 'mark';
  const tagline = showTagline ?? size >= 32;

  if (reduce) {
    return (
      <LogoStatic
        size={size} width={width} height={height} variant={variant}
        layout={layout} showTagline={showTagline} className={className} label={label}
      />
    );
  }

  /** Node i lights up as the line arrives at it. */
  const nodeDelay = (i: number) => delay + (i / (LOGO_NODES.length - 1)) * duration;

  const pulse: Transition = {
    duration: 2.6,
    repeat: Infinity,
    ease: 'easeInOut',
  };

  return (
    <motion.span
      className={[
        'inline-flex select-none',
        layout === 'stacked' ? 'flex-col items-center' : 'flex-row items-center',
        className ?? '',
      ].join(' ')}
      style={{ fontSize: m.root, width, height, gap: markOnly ? undefined : m.gap }}
      onHoverStart={replayOnHover ? () => setRun((r) => r + 1) : undefined}
      {...(markOnly ? { role: 'img', 'aria-label': label } : {})}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ width: m.mark, height: m.mark }}
        fill="none"
        aria-hidden={!markOnly}
        className="shrink-0 overflow-visible"
      >
        <defs>
          <linearGradient
            id={`la-line-${uid}`}
            gradientUnits="userSpaceOnUse"
            x1={74} y1={8} x2={25} y2={88}
          >
            <stop offset="0" stopColor={LOGO_COLORS.accent} />
            <stop offset="0.55" stopColor="#2F6BEE" />
            <stop offset="1" stopColor={LOGO_COLORS.primary} />
          </linearGradient>
          <radialGradient id={`la-glow-${uid}`}>
            <stop offset="0" stopColor={LOGO_COLORS.glow} stopOpacity="0.42" />
            <stop offset="0.55" stopColor={LOGO_COLORS.glow} stopOpacity="0.10" />
            <stop offset="1" stopColor={LOGO_COLORS.glow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`la-star-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor={LOGO_COLORS.glow} />
            <stop offset="1" stopColor={LOGO_COLORS.primary} />
          </linearGradient>
        </defs>

        {/* loose sky — a slow, offset shimmer so it never beats in time */}
        {LOGO_STARFIELD.map((n, i) => (
          <motion.circle
            key={`f${n.cx}-${n.cy}`}
            cx={n.cx} cy={n.cy} r={n.r}
            fill={`url(#la-line-${uid})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.5, 0.15] }}
            transition={{ ...pulse, duration: 3.4 + i * 0.5, delay: delay + i * 0.4 }}
          />
        ))}

        {/* the line, drawn from the top terminal to the bottom one */}
        <motion.path
          key={run}
          d={LOGO_PATH}
          stroke={`url(#la-line-${uid})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{
            pathLength: { duration, delay, ease: EASE },
            opacity: { duration: 0.25, delay },
          }}
        />

        {/* nodes: arrive with the line, then breathe */}
        {LOGO_NODES.map((n, i) => (
          <motion.circle
            key={`${run}-n${n.cx}-${n.cy}`}
            cx={n.cx} cy={n.cy} r={n.r}
            fill={`url(#la-line-${uid})`}
            // No transform-box here on purpose. Framer measures the element
            // and writes transform-origin in user units — for this circle,
            // "78px 20px", which is its centre in viewBox space and exactly
            // right under the default transform-box: view-box. Setting
            // fill-box re-anchors those same numbers to the bounding box's
            // top-left corner, putting the origin at (151, 35) and swinging
            // the dot instead of pulsing it.
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.35, 1, 1.18, 1], opacity: 1 }}
            transition={{
              scale: {
                duration: 2.8,
                times: [0, 0.16, 0.34, 0.67, 1],
                delay: nodeDelay(i),
                repeat: Infinity,
                repeatDelay: 0.6,
                ease: 'easeInOut',
              },
              opacity: { duration: 0.3, delay: nodeDelay(i) },
            }}
          />
        ))}

        {/* the glow behind the star, breathing on its own slower clock */}
        <motion.circle
          cx={LOGO_STAR_CENTER.cx}
          cy={LOGO_STAR_CENTER.cy}
          r={LOGO_STAR_CENTER.r * 1.7}
          fill={`url(#la-glow-${uid})`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.7, 1, 0.7] }}
          transition={{ ...pulse, duration: 4.2, delay: delay + duration * 0.35 }}
        />

        {/* the star itself: a slow turn plus a twinkle */}
        <motion.path
          d={LOGO_STAR_PATH}
          fill={`url(#la-star-${uid})`}
          initial={{ scale: 0, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: [0.75, 1, 0.75], rotate: 360 }}
          transition={{
            scale: { duration: 0.7, delay: delay + duration * 0.35, ease: EASE },
            opacity: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay },
            rotate: { duration: 42, repeat: Infinity, ease: 'linear' },
          }}
        />
      </svg>

      {!markOnly && (
        <span
          className={`logo-words flex flex-col ${layout === 'stacked' ? 'items-center' : 'items-start'}`}
          style={{ gap: m.taglineGap }}
        >
          <motion.span
            className="font-jakarta font-bold leading-none tracking-[-0.02em] whitespace-nowrap"
            style={{ fontSize: m.word, color: wordColor(variant) }}
            initial={{ opacity: 0, y: size * 0.17 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: delay + duration * 0.4, ease: EASE }}
          >
            Star
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              {' '}Solution
            </span>
          </motion.span>

          {tagline && (
            <motion.span
              className="font-jakarta font-semibold uppercase leading-none whitespace-nowrap"
              style={{
                fontSize: m.tagline,
                letterSpacing: '0.22em',
                color: variant === 'dark' ? LOGO_COLORS.tint : LOGO_COLORS.primary,
              }}
              initial={{ opacity: 0, y: size * 0.12 }}
              animate={{ opacity: variant === 'dark' ? 0.85 : 0.75, y: 0 }}
              transition={{ duration: 0.7, delay: delay + duration * 0.58, ease: EASE }}
            >
              Automate
              <span style={{ color: LOGO_COLORS.primary }}> • </span>
              Connect
              <span style={{ color: LOGO_COLORS.accent }}> • </span>
              Grow
            </motion.span>
          )}
        </span>
      )}
    </motion.span>
  );
}

export default LogoAnimated;
