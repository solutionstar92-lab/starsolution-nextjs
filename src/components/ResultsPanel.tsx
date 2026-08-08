'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import * as React from 'react';
import { Icon } from './Icon';
import { Counter } from './Counter';
import type { Chart, Figure } from '@/lib/types';

/**
 * Proven results. Each figure is a switch: clicking one repaints the chart with
 * that metric. Bar heights come from the values, never hand-set percentages.
 */
export function ResultsPanel({ charts, figures }: { charts: Record<string, Chart>; figures: Figure[] }) {
  const [metric, setMetric] = React.useState('revenue');
  const chart = charts[metric] ?? charts.revenue;
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();

  const max = Math.max(...chart.bars.map((b) => b.val)) || 1;
  const select = (key: string) => setMetric((cur) => (cur === key ? 'revenue' : key));

  return (
    <div className="results-panel is-lit" id="resultsPanel" ref={ref}>
      <figure className="rp-chart">
        <figcaption>
          <AnimatePresence mode="wait">
            <motion.div
              key={metric}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              <p className="rp-kicker">{chart.kicker}</p>
              <p className="rp-head">
                <Counter
                  className="rp-num"
                  value={chart.count}
                  decimals={chart.decimals ?? 0}
                  prefix={chart.prefix ?? ''}
                  suffix={chart.suffix ?? ''}
                  runKey={metric}
                />
                <span className="rp-head-label">{chart.label}</span>
              </p>
              <p className="rp-note">{chart.note}</p>
            </motion.div>
          </AnimatePresence>
        </figcaption>

        <div
          className="rp-plot"
          role="img"
          aria-label={`${chart.kicker}: ${chart.bars.map((b) => `${b.cap} ${b.text}`).join(', ')}`}
        >
          <span className="rp-line" style={{ ['--t' as string]: '12%' }} />
          <span className="rp-line" style={{ ['--t' as string]: '40%' }} />
          <span className="rp-line" style={{ ['--t' as string]: '68%' }} />

          {chart.bars.map((bar, i) => {
            const solo = chart.bars.length === 1;
            const after = !bar.ghost && (solo || i === chart.bars.length - 1);
            const pct = Math.max(6, Math.round((bar.val / max) * 100));
            return (
              <div
                key={`${metric}-${bar.cap}`}
                className={`rp-col${after ? ' rp-col-after' : ''}${bar.ghost ? ' rp-col-ghost' : ''}${solo ? ' rp-col-solo' : ''}`}
              >
                <span className="rp-val">{bar.text}</span>
                <motion.span
                  className="rp-bar"
                  style={{ ['--h' as string]: `${pct}%`, transformOrigin: 'bottom' }}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.95, delay: i * 0.18, ease: [0.16, 0.84, 0.3, 1] }}
                />
                <span className="rp-cap">{bar.cap}</span>
              </div>
            );
          })}
        </div>
      </figure>

      <div className="rp-tiles">
        {figures.map((f) => {
          const on = metric === f.metric;
          return (
            <article
              key={f.metric}
              className={`rt${on ? ' is-active' : ''}`}
              data-metric={f.metric}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              onClick={() => select(f.metric)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(f.metric); }
              }}
            >
              <span className="rt-icon"><Icon name={f.icon} /></span>
              <p className="rt-num">
                <Counter value={f.count} decimals={f.decimals ?? 0} prefix={f.prefix ?? ''} suffix={f.suffix ?? ''} />
              </p>
              <p className="rt-label">{f.label}</p>
              <p className="rt-sub">{f.sub}</p>
              <span className="rt-hint">View chart</span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
