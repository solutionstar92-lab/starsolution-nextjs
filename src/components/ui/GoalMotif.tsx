import * as React from 'react';

/**
 * The watermark behind a goal card.
 *
 * A small scene rather than one big glyph: a few related marks, clustered in
 * the bottom-right and only just cropped by the corner. A single shape blown up
 * to fill the card read as a background texture; several small ones read as a
 * picture of what the card does, and take far less of it.
 *
 * Strokes are heavy (4–5 units in a 120-wide box) on purpose. A watermark sits
 * at 7% opacity to stay behind text, and hairlines simply disappear at that
 * strength — whatever is drawn here has to survive being almost invisible.
 *
 * Keyed off the goal's own `icon` value, so a goal added in the admin picks up
 * the right motif with no second field to keep in sync, and anything unmapped
 * falls through to a shape rather than to nothing.
 */
const MOTIFS: Record<string, React.ReactNode> = {
  // Increase revenue — currency, more of it than you started with.
  revenue: (
    <g
      fill="currentColor"
      fontFamily="'General Sans', 'Satoshi', system-ui, sans-serif"
      fontWeight="700"
    >
      <text x="2" y="88" fontSize="58">$</text>
      <text x="48" y="58" fontSize="40">$</text>
      <text x="84" y="92" fontSize="30">$</text>
      <text x="92" y="42" fontSize="21">$</text>
    </g>
  ),

  /*
   * Automate operations — a node graph.
   *
   * The key stays `bolt` because that is what the goal row carries and what the
   * card's own icon uses; only the watermark differs.
   *
   * Third attempt, and the first two are why this one looks the way it does.
   * Rectangles joined by right-angle elbows read as a corporate flowchart —
   * every box the same, nothing moving. Gears read as machinery, but machinery
   * is not what is being sold here.
   *
   * What makes this one a *workflow* rather than a diagram is that no two nodes
   * are the same shape and the connectors curve: a trigger (the ringed dot),
   * a branch (the diamond), and two steps that run in parallel, joined by
   * beziers with arrowheads so the thing has a direction. That is the shape of
   * a real automation, and it is what n8n — on the platform row of this very
   * page — actually looks like on screen.
   */
  bolt: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* trigger */}
      <circle cx="13" cy="50" r="10" />
      <circle cx="13" cy="50" r="2.6" fill="currentColor" stroke="none" />

      {/* branch */}
      <path d="M46 36 60 50 46 64 32 50Z" />

      {/* the two steps it fans out into */}
      <rect x="84" y="13" width="33" height="23" rx="8" />
      <rect x="84" y="64" width="33" height="23" rx="8" />

      {/* curved connectors, each with a head so the flow has a direction */}
      <path d="M23 50h6" />
      <path d="M26.5 46.5 30 50l-3.5 3.5" />

      <path d="M60 50c11 0 11-25.5 21-25.5" />
      <path d="M77.5 21 81 24.5 77.5 28" />

      <path d="M60 50c11 0 11 25.5 21 25.5" />
      <path d="M77.5 72 81 75.5 77.5 79" />
    </g>
  ),

  // Improve customer support — a question, and the reply coming back.
  chat: (
    <g fill="currentColor">
      <rect x="1" y="8" width="60" height="38" rx="13" />
      <path d="M15 46v15l15-15Z" />
      <g opacity=".72">
        <rect x="63" y="52" width="50" height="32" rx="11" />
        <path d="M99 84v13l-13-13Z" />
      </g>
    </g>
  ),

  // Make better decisions — the dial and the trend, i.e. a dashboard.
  gauge: (
    <g>
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path d="M4 60a25 25 0 0 1 46 0" />
        <path d="M27 58 40 40" />
      </g>
      <g fill="currentColor">
        <rect x="66" y="54" width="11" height="30" rx="3.5" />
        <rect x="83" y="40" width="11" height="44" rx="3.5" />
        <rect x="100" y="26" width="11" height="58" rx="3.5" />
      </g>
    </g>
  ),

  // Anything else: concentric rings, which read as "a target" whatever it is.
  star: (
    <g fill="none" stroke="currentColor" strokeWidth="5">
      <circle cx="58" cy="50" r="40" />
      <circle cx="58" cy="50" r="24" />
      <circle cx="58" cy="50" r="8" />
    </g>
  ),
};

export function GoalMotif({ icon }: { icon?: string }) {
  const shape = (icon && MOTIFS[icon]) ?? MOTIFS.star;
  return (
    <svg className="goal-motif" viewBox="0 0 120 100" aria-hidden="true" focusable="false">
      {shape}
    </svg>
  );
}
