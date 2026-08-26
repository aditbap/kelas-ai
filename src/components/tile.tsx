import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type TileSurface = 'canvas' | 'parchment' | 'dark' | 'dark-2' | 'dark-3';

/*
  Full-bleed section tile. The surface color change is the section divider, so
  tiles deliberately carry no border, no radius, and no shadow. Alternating
  light and dark tiles is the page's structural rhythm.

  The dark surfaces stay dark in both color schemes: they are a brand device,
  not a theme. In dark mode their tokens shift a step lighter than the canvas so
  the alternation still reads instead of collapsing into one flat black.
*/
const surfaces: Record<TileSurface, string> = {
  canvas: 'bg-canvas text-ink',
  parchment: 'bg-parchment text-ink',
  dark: 'bg-tile-1 text-on-dark',
  'dark-2': 'bg-tile-2 text-on-dark',
  'dark-3': 'bg-tile-3 text-on-dark',
};

export function Tile({
  surface = 'canvas',
  className,
  innerClassName,
  children,
  ...props
}: {
  surface?: TileSurface;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
} & React.ComponentProps<'section'>) {
  return (
    <section className={cn('tile', surfaces[surface], className)} {...props}>
      <div className={cn('mx-auto w-full max-w-6xl px-6', innerClassName)}>{children}</div>
    </section>
  );
}
