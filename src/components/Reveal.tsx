'use client';

import { motion, useReducedMotion } from 'framer-motion';
import * as React from 'react';

/**
 * Scroll reveal. Replaces the IntersectionObserver in the original script with
 * Framer Motion's viewport trigger, so it composes with the route transitions.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  as = 'div',
  repeat = false,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li' | 'header' | 'dl' | 'ul' | 'nav' | 'figure';
  /** Re-run the reveal on every pass, so scrolling back up hides it again. */
  repeat?: boolean;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y, scale: 0.995 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={
        repeat
          ? // Symmetric: a card shows only while it is inside the viewport.
            // The negative bottom margin pulls the trigger line up off the
            // bottom edge, so cards fade in just before they land and fade
            // back out as soon as scrolling up drops them below it. No top
            // buffer — one taller than the section would keep every card
            // permanently "in view" and nothing would ever reverse.
            { once: false, amount: 0.15, margin: '0px 0px -12% 0px' }
          : { once: true, amount: 0.15, margin: '0px 0px -8% 0px' }
      }
      transition={{ duration: repeat ? 0.45 : 0.62, delay, ease: [0.16, 0.84, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}

/** Staggers its children on the way in. */
export function RevealGroup({
  children,
  className,
  step = 0.07,
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="shown"
      viewport={{ once: true, amount: 0.12 }}
      variants={{ shown: { transition: { staggerChildren: step } } }}
    >
      {children}
    </motion.div>
  );
}

export const revealItem = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 0.84, 0.3, 1] as const } },
};
