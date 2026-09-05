import * as React from 'react';
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

/**
 * The Star Solution logo, as a still.
 *
 * A server component: no state, no effects, nothing to hydrate. Use this
 * everywhere the logo is furniture — headers, footers, favicons, print, the
 * open-graph card — and keep LogoAnimated for the one place per screen where
 * the motion is the point.
 *
 * The constellation is SVG and the words are real text. That split is
 * deliberate: a wordmark set in <text> cannot be selected, searched, read by a
 * screen reader as a heading would be, or reflowed, and it renders as nothing
 * at all if the webfont fails. As HTML it is all of those things, and the
 * gradient is a Tailwind background clipped to the glyphs.
 *
 * Every gradient gets an id from useId(), so two logos on one page cannot
 * capture each other's fills — the failure mode there is silent and looks like
 * a rendering bug, not a name collision.
 */
export function LogoStatic({
  size = 40,
  width,
  height,
  variant = 'auto',
  layout = 'lockup',
  showTagline,
  className,
  label = 'Star Solution',
}: LogoBaseProps) {
  const uid = React.useId().replace(/:/g, '');
  const m = logoMetrics(size);
  const markOnly = layout === 'mark';
  // Below ~32px the tagline is under 5px of letterspaced caps: a grey smear.
  const tagline = showTagline ?? size >= 32;

  return (
    <span
      className={[
        'inline-flex select-none',
        layout === 'stacked' ? 'flex-col items-center' : 'flex-row items-center',
        className ?? '',
      ].join(' ')}
      style={{ fontSize: m.root, width, height, gap: markOnly ? undefined : m.gap }}
      {...(markOnly ? { role: 'img', 'aria-label': label } : {})}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ width: m.mark, height: m.mark }}
        fill="none"
        // The wordmark beside it already says the name; a second copy in the
        // accessibility tree just makes the logo read twice.
        aria-hidden={!markOnly}
        className="shrink-0 overflow-visible"
      >
        <defs>
          {/* userSpaceOnUse, not the default objectBoundingBox: every element
              then samples one gradient laid across the whole viewBox, so the
              nodes and the line agree about the colour at any given point. */}
          <linearGradient
            id={`sl-line-${uid}`}
            gradientUnits="userSpaceOnUse"
            x1={74} y1={8} x2={25} y2={88}
          >
            <stop offset="0" stopColor={LOGO_COLORS.accent} />
            <stop offset="0.55" stopColor="#2F6BEE" />
            <stop offset="1" stopColor={LOGO_COLORS.primary} />
          </linearGradient>

          <radialGradient id={`sl-glow-${uid}`}>
            <stop offset="0" stopColor={LOGO_COLORS.glow} stopOpacity="0.42" />
            <stop offset="0.55" stopColor={LOGO_COLORS.glow} stopOpacity="0.10" />
            <stop offset="1" stopColor={LOGO_COLORS.glow} stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`sl-star-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor={LOGO_COLORS.glow} />
            <stop offset="1" stopColor={LOGO_COLORS.primary} />
          </linearGradient>
        </defs>

        {/* loose sky, behind everything */}
        {LOGO_STARFIELD.map((n) => (
          <circle
            key={`f${n.cx}-${n.cy}`}
            cx={n.cx} cy={n.cy} r={n.r}
            fill={`url(#sl-line-${uid})`}
            opacity="0.38"
          />
        ))}

        <path
          d={LOGO_PATH}
          stroke={`url(#sl-line-${uid})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {LOGO_NODES.map((n) => (
          <circle
            key={`n${n.cx}-${n.cy}`}
            cx={n.cx} cy={n.cy} r={n.r}
            fill={`url(#sl-line-${uid})`}
          />
        ))}

        <circle
          cx={LOGO_STAR_CENTER.cx}
          cy={LOGO_STAR_CENTER.cy}
          r={LOGO_STAR_CENTER.r * 1.7}
          fill={`url(#sl-glow-${uid})`}
        />
        <path d={LOGO_STAR_PATH} fill={`url(#sl-star-${uid})`} />
      </svg>

      {!markOnly && (
        <span
          className={`logo-words flex flex-col ${layout === 'stacked' ? 'items-center' : 'items-start'}`}
          style={{ gap: m.taglineGap }}
        >
          <span
            className="font-jakarta font-bold leading-none tracking-[-0.02em] whitespace-nowrap"
            style={{ fontSize: m.word, color: wordColor(variant) }}
          >
            Star
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              {' '}Solution
            </span>
          </span>

          {tagline && (
            <span
              className="font-jakarta font-semibold uppercase leading-none whitespace-nowrap"
              style={{
                fontSize: m.tagline,
                letterSpacing: '0.22em',
                color: variant === 'dark' ? LOGO_COLORS.tint : LOGO_COLORS.primary,
                opacity: variant === 'dark' ? 0.85 : 0.75,
              }}
            >
              Automate
              <span style={{ color: LOGO_COLORS.primary }}> • </span>
              Connect
              <span style={{ color: LOGO_COLORS.accent }}> • </span>
              Grow
            </span>
          )}
        </span>
      )}
    </span>
  );
}

export default LogoStatic;
