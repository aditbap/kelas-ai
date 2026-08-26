import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/*
  Apple button grammar (docs/apple-DESIGN.md):
  full-pill radius is the "this is an action" signal, Action Blue is the only
  accent, `scale(0.95)` on press is the system-wide micro-interaction, and no
  button ever carries a shadow.
*/
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'font-sans transition-[background-color,color,border-color,transform] duration-200',
    'outline-none select-none active:scale-[0.95]',
    'disabled:pointer-events-none disabled:opacity-40',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        // The signature Action Blue pill.
        default: 'rounded-full bg-action text-[#ffffff] hover:bg-action-focus',
        // Ghost pill: the second CTA when two pills sit together.
        outline: 'rounded-full border border-action bg-transparent text-action hover:bg-action/8',
        // Pearl capsule: quiet secondary action on a light surface.
        secondary: 'rounded-md border border-divider-soft bg-pearl text-ink hover:bg-parchment',
        // Chromeless: navigation and low-emphasis actions.
        ghost: 'rounded-md text-ink hover:bg-parchment',
        // Dark utility rect, used in the global nav.
        dark: 'rounded-sm bg-ink text-canvas hover:opacity-90',
        destructive: 'rounded-full bg-destructive text-white hover:opacity-90',
        link: 'text-action underline-offset-4 hover:underline',
      },
      size: {
        // 44px, the documented minimum touch target.
        default: 'h-11 px-[22px] text-body',
        sm: 'h-8 px-[15px] text-caption',
        xs: 'h-7 px-3 text-fine',
        lg: 'h-12 px-7 text-[18px] font-light',
        icon: 'size-11 rounded-full',
        'icon-sm': 'size-8 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  render,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      render={render}
      // When `render` swaps in a Link, the element is no longer a native
      // <button>; telling the primitive that keeps its semantics honest.
      nativeButton={render ? false : undefined}
      {...props}
    />
  );
}

export { Button, buttonVariants };
