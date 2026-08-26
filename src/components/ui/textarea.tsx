import * as React from 'react';

import { cn } from '@/lib/utils';

/** Multi-line sibling of Input - same 11px radius and border treatment, sized for prose instead of a single line. */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-24 w-full min-w-0 resize-y rounded-md border border-hairline bg-elevated px-3.5 py-2.5 text-body text-ink',
        'transition-[border-color,box-shadow] outline-none',
        'placeholder:text-ink-muted',
        'focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-40',
        'aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
