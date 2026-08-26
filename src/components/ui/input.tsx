import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

/*
  Radius rule for the project: pill = actions (buttons, search), 18px = cards,
  11px = text inputs. Placeholder uses `ink-muted` rather than `ink-faint`
  because only the former clears WCAG AA (5.07:1) against the canvas.
*/
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-md border border-hairline bg-elevated px-3.5 text-body text-ink',
        'transition-[border-color,box-shadow] outline-none',
        'placeholder:text-ink-muted',
        'focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-40',
        'aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20',
        'file:inline-flex file:border-0 file:bg-transparent file:text-caption file:font-medium file:text-ink',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
