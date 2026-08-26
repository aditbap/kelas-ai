'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/*
  Scroll-reveal for tile content. Motivation: each full-bleed tile is one
  gallery moment, so revealing its stack on entry paces the scroll to the tile
  rhythm and keeps attention on a single message at a time.

  Only `transform` and `opacity` animate. Collapses to a static render under
  `prefers-reduced-motion`.
*/
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
