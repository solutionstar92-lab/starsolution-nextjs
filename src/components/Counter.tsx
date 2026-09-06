'use client';

import { useInView, useReducedMotion } from 'framer-motion';
import * as React from 'react';

interface Props {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Re-runs the count whenever this changes — used when the chart switches metric. */
  runKey?: string | number;
}

/** Counts up to `value` the first time it enters the viewport. */
export function Counter({ value, decimals = 0, prefix = '', suffix = '', className, runKey }: Props) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const reduce = useReducedMotion();
  const [shown, setShown] = React.useState(reduce ? value : 0);
  const started = React.useRef<string | number | undefined>(undefined);

  React.useEffect(() => {
    if (!inView) return;
    if (reduce) { setShown(value); return; }
    // Snap, do not bail. The cleanup below cancels the rAF whenever this effect
    // re-runs — and with once:false, useInView re-runs it every time the element
    // crosses the threshold. The old guard returned early on that second pass,
    // so a count interrupted mid-flight was left frozen short of its target:
    // 76 where the card claims 85. Showing the final value instead means the
    // number is either fully animated or simply correct, never neither.
    if (started.current === (runKey ?? 'once')) { setShown(value); return; }
    started.current = runKey ?? 'once';

    let frame = 0;
    const duration = 1400;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(step);
      else setShown(value);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, reduce, runKey]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}
