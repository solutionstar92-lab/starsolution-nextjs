import * as React from 'react';

/**
 * The drawing in a case study card's header.
 *
 * Every card used to show the same rising line, which made five different
 * results look like one template. Each now gets the shape of its own metric:
 * orders climb, followers stack up, conversion narrows a funnel, ad spend hits
 * a target, and a dashboard is a dashboard.
 *
 * Chosen from what the card already says rather than from a new column or a map
 * of slugs. These rows come from Supabase, so anything keyed per-row is
 * something to maintain per-row; matching on the KPI's own words means a case
 * study added tomorrow picks the right drawing on its own, and anything
 * unrecognised falls back to the rising line — which is true of every result
 * here, so the fallback is never wrong, only less specific.
 */
export type VisualKey = 'trend' | 'bars' | 'funnel' | 'target' | 'dashboard';

export function pickVisual(...parts: (string | undefined)[]): VisualKey {
  // Everything the card says, not just its KPI label. The revenue case study
  // is titled "Revenue in 4 months" but its actual story is in the before and
  // after — "No live data" to "Live dashboard" — and reading only the label
  // handed it the same generic trend line as the orders card.
  const t = parts.filter(Boolean).join(" ").toLowerCase();
  if (/follow|social|instagram|tiktok|audience|subscriber/.test(t)) return 'bars';
  if (/conversion|cvr|checkout|cart/.test(t)) return 'funnel';
  if (/roas|ad spend|ads|acquisition|cpa/.test(t)) return 'target';
  if (/dashboard|report|analytics|visibility/.test(t)) return 'dashboard';
  return 'trend';
}

const VISUALS: Record<VisualKey, React.ReactNode> = {
  /* Orders per day, 20 to 85. A real climb gives a little back between rises,
     which is what makes it read as a measurement rather than a flourish. */
  trend: (
    <>
      <polyline points="4,52 30,40 52,47 78,31 100,38 126,21 148,28 176,7" />
      <polyline className="cv-head" points="152,7 176,7 176,29" />
    </>
  ),

  /* Followers, 2K to 18K. A follower count goes up and stays up, so the
     drawing counts with it — six columns, each taller than the last. */
  bars: (
    <path className="cv-bars" d="M18 54V44M48 54V37M78 54V29M108 54V21M138 54V14M168 54V6" />
  ),

  /* Conversion, 1.8% to 4.2%. A funnel: everyone who arrives down the left,
     the few who come out of the spout on the right. */
  funnel: (
    <>
      <path d="M16 9v42" />
      <polyline points="16,9 138,25 138,35 16,51" />
      <circle cx="162" cy="30" r="4" />
      <circle cx="183" cy="30" r="4" />
    </>
  ),

  /* ROAS, 1.8x to 4.5x on Meta and Google. Spend flying in and landing in the
     middle of the target is what return on ad spend actually means. */
  target: (
    <>
      <circle cx="158" cy="30" r="21" />
      <circle cx="158" cy="30" r="10" />
      <circle className="cv-dot" cx="158" cy="30" r="2.5" />
      <path d="M14 49 138 33" />
      <polyline points="126,26 141,32 130,42" />
    </>
  ),

  /* "No live data" to "Live dashboard". Here the panel is the result. */
  dashboard: (
    <>
      <rect x="10" y="7" width="180" height="46" rx="9" />
      <path className="cv-bars" d="M34 43V33M56 43V25M78 43V36" />
      <polyline points="100,40 124,28 146,33 176,17" />
    </>
  ),
};

export function CaseVisual({ parts }: { parts: (string | undefined)[] }) {
  const key = pickVisual(...parts);
  return (
    <svg className={`case-spark cv-${key}`} viewBox="0 0 200 60" aria-hidden="true">
      {VISUALS[key]}
    </svg>
  );
}
