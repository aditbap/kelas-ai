'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { setLocaleAction } from '@/lib/i18n/actions';
import type { Locale } from '@/lib/i18n/dictionaries';
import { useLocale } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

/*
  Text-only EN/ID switch, colored via `currentColor` so it drops into a dark
  nav or a light one without a variant prop. Flipping it sets the locale
  cookie server-side, then refreshes so every Server Component re-renders
  with the new dictionary.
*/
export function LanguageToggle({ className }: { className?: string }) {
  const { locale } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale || isPending) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn('inline-flex items-center gap-1', className)}
    >
      <button
        type="button"
        onClick={() => switchTo('en')}
        aria-pressed={locale === 'en'}
        className={cn(
          'transition-opacity',
          locale === 'en' ? 'font-semibold opacity-100' : 'opacity-60 hover:opacity-90',
        )}
      >
        EN
      </button>
      <span aria-hidden className="opacity-40">
        /
      </span>
      <button
        type="button"
        onClick={() => switchTo('id')}
        aria-pressed={locale === 'id'}
        className={cn(
          'transition-opacity',
          locale === 'id' ? 'font-semibold opacity-100' : 'opacity-60 hover:opacity-90',
        )}
      >
        ID
      </button>
    </div>
  );
}
