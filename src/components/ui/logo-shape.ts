/**
 * The Star Solution mark, as data.
 *
 * Both LogoStatic and LogoAnimated draw from this file rather than each
 * carrying their own copy of the path. The two have to be the same shape to the
 * pixel — the animated one resolves to the static one when it finishes, and on
 * `prefers-reduced-motion` it *is* the static one — and a second copy of nine
 * coordinates is a second copy that drifts.
 *
 * Geometry is a 100x100 viewBox. The nodes trace an S from the top-right
 * terminal, over the top, down the left of the upper bowl, across the middle
 * diagonal, down the right of the lower bowl and out to the bottom-left
 * terminal. The glow star sits on that middle diagonal, which is where the two
 * halves of the letter cross.
 */

/** One node on the constellation. */
export interface LogoNode {
  /** Centre, in viewBox units. */
  cx: number;
  cy: number;
  /** Radius, in viewBox units. */
  r: number;
}

/** Brand palette, from the guidelines. */
export const LOGO_COLORS = {
  /** Deep navy — the dark ground, and the wordmark on light. */
  dark: '#0B1026',
  /** Primary blue — the foot of the constellation gradient. */
  primary: '#2563EB',
  /** Cyan — the centre star only. Nothing else uses it. */
  glow: '#06B6FF',
  /** Purple — the head of the constellation gradient. */
  accent: '#7C3AED',
  /** Lavender tint, for the tagline on dark grounds. */
  tint: '#C4B5FD',
  /** Off-white — the wordmark on dark. */
  light: '#F1F5F9',
} as const;

/**
 * The ten nodes of the S, in stroke order.
 *
 * Order matters twice over. LOGO_PATH is built from this list, so the drawing
 * animation follows the route a pen would take; and because the connectors are
 * straight, the letter lives entirely in where these sit. An earlier pass had
 * nine nodes on a coarser arc and the polyline read as a zigzag rather than an
 * S — the fix was more nodes through the two bowls, not curved connectors,
 * which stop looking like a constellation.
 *
 * The letter runs: top-right terminal, left over the top, down the outside of
 * the upper bowl, across the middle diagonal, down the outside of the lower
 * bowl, then left and out to the bottom-left terminal. The terminals are the
 * largest nodes — they are where the stroke starts and stops.
 */
export const LOGO_NODES: readonly LogoNode[] = [
  { cx: 78, cy: 20, r: 5.0 }, // top-right terminal
  { cx: 57, cy: 10, r: 2.6 },
  { cx: 34, cy: 14, r: 3.0 },
  { cx: 23, cy: 31, r: 2.6 },
  { cx: 38, cy: 44, r: 2.4 }, // enters the middle diagonal
  { cx: 62, cy: 55, r: 2.4 }, // leaves it
  { cx: 77, cy: 68, r: 3.0 },
  { cx: 66, cy: 85, r: 2.6 },
  { cx: 42, cy: 90, r: 2.8 },
  { cx: 20, cy: 78, r: 5.0 }, // bottom-left terminal
] as const;

/**
 * Loose dots off the letter.
 *
 * They belong to the constellation, not the S — the mark reads as a piece of
 * sky with a letter found in it rather than a letter made of dots.
 */
export const LOGO_STARFIELD: readonly LogoNode[] = [
  { cx: 68, cy: 34, r: 1.5 },
  { cx: 14, cy: 52, r: 1.3 },
  { cx: 88, cy: 50, r: 1.2 },
  { cx: 31, cy: 66, r: 1.4 },
] as const;

/** The connecting line, derived so it can never disagree with the nodes. */
export const LOGO_PATH = LOGO_NODES
  .map((n, i) => `${i === 0 ? 'M' : 'L'}${n.cx} ${n.cy}`)
  .join(' ');

/**
 * The glow star, at the centre of the middle diagonal — which is the optical
 * centre of the whole mark.
 *
 * r is 12, not the 15 it started at. At 15 the star and its halo covered the
 * crossing they are supposed to sit on and the S stopped being legible at
 * small sizes; the mark has to survive being a 20px favicon.
 */
export const LOGO_STAR_CENTER = { cx: 50, cy: 49, r: 12 } as const;

/**
 * A four-pointed star with concave sides: four points at radius r, with the
 * quadratic control points pulled in close to the centre so the waist pinches.
 */
function fourPointStar(cx: number, cy: number, r: number, waist = 0.18): string {
  const k = r * waist;
  return [
    `M${cx} ${cy - r}`,
    `Q${cx + k} ${cy - k} ${cx + r} ${cy}`,
    `Q${cx + k} ${cy + k} ${cx} ${cy + r}`,
    `Q${cx - k} ${cy + k} ${cx - r} ${cy}`,
    `Q${cx - k} ${cy - k} ${cx} ${cy - r}`,
    'Z',
  ].join(' ');
}

export const LOGO_STAR_PATH = fourPointStar(
  LOGO_STAR_CENTER.cx,
  LOGO_STAR_CENTER.cy,
  LOGO_STAR_CENTER.r,
);

/** Which ground the logo is sitting on. `auto` follows the CSS cascade. */
export type LogoVariant = 'auto' | 'light' | 'dark';

/** How much of the lockup to draw. */
export type LogoLayout = 'lockup' | 'mark' | 'stacked';

/** Props shared by both logo components. */
export interface LogoBaseProps {
  /**
   * Scale knob, in px. Drives the mark, the wordmark and the tagline together,
   * so one number resizes the whole lockup in proportion. Default 40.
   */
  size?: number;
  /** CSS width for the root. Any length; use '100%' to fill a container. */
  width?: number | string;
  /** CSS height for the root. */
  height?: number | string;
  /**
   * `light` forces the dark wordmark, `dark` forces the light one, and `auto`
   * (the default) inherits `currentColor` so the logo takes the colour of
   * whatever it is dropped into.
   */
  variant?: LogoVariant;
  /** `mark` is the constellation alone; `stacked` puts the words underneath. */
  layout?: LogoLayout;
  /** Show "AUTOMATE • CONNECT • GROW". Off below ~32px, where it turns to mud. */
  showTagline?: boolean;
  className?: string;
  /** Accessible name. Only used when there is no visible wordmark to read. */
  label?: string;
}

/**
 * Type sizes as CSS lengths, shared so both logos agree.
 *
 * Everything below the root is in `em`, and the root carries `font-size: size`.
 * That is what makes the lockup responsive without a second render path — a
 * media query setting font-size on the logo rescales the mark, the wordmark,
 * the tagline and every gap together and in proportion, with no JavaScript and
 * nothing to recompute on resize.
 */
export function logoMetrics(size: number) {
  return {
    /**
     * Root font-size. Goes through a custom property rather than a bare px
     * value because an inline font-size outranks every stylesheet rule — with
     * the number written straight into style, a media query could not resize
     * the logo and the em-based layout above would be pointless. Set
     * `--logo-size` on the element (or any ancestor) to override the prop.
     */
    root: `var(--logo-size, ${size}px)`,
    mark: '1em',
    word: '0.62em',
    // the floor keeps letterspaced caps legible if a container scales us down
    tagline: 'max(6px, 0.155em)',
    gap: '0.3em',
    taglineGap: '0.1em',
  };
}

/** The wordmark colour for a variant. `auto` defers to the cascade. */
export function wordColor(variant: LogoVariant): string | undefined {
  if (variant === 'light') return LOGO_COLORS.dark;
  if (variant === 'dark') return LOGO_COLORS.light;
  return undefined; // inherit
}
