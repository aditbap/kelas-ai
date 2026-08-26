import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils';

import { PublishForm } from './publish-form';

export type StudioTab = 'outline' | 'preview' | 'settings';

/*
  Module Studio chrome (see the "Module Studio" design canvas): a frosted
  sticky command bar carrying the module's identity, its section tabs, and the
  two publishing actions, with a full-bleed parchment footer closing the page.

  It breaks out of AppShell's content padding with matching negative margins so
  the bar spans edge to edge like the design, then re-applies that padding on
  its own inner container. The negative margin exactly cancels the padding, so
  nothing extends past the content box and the page never scrolls sideways.
*/
export function StudioShell({
  moduleId,
  title,
  isPublished,
  updatedAt,
  activeTab,
  t,
  publishFormT,
  children,
}: {
  moduleId: string;
  title: string;
  isPublished: boolean;
  updatedAt: string;
  activeTab: StudioTab;
  t: Dictionary['editor']['studio'];
  publishFormT: Dictionary['editor']['moduleDetail']['publishForm'];
  children: ReactNode;
}) {
  const tabs: { key: StudioTab; label: string }[] = [
    { key: 'outline', label: t.tabs.outline },
    { key: 'preview', label: t.tabs.preview },
    { key: 'settings', label: t.tabs.settings },
  ];

  return (
    <div className="-mx-6 -mt-6 md:-mx-10 md:-mt-10">
      <div className="sticky top-12 z-30 border-b border-hairline bg-parchment/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex min-h-[52px] w-full max-w-[1440px] flex-wrap items-center gap-x-5 gap-y-1 px-6 md:px-10">
          <div className="flex min-w-0 items-baseline gap-2.5 py-2">
            <span className="truncate text-tagline text-ink">{title}</span>
            <span className="shrink-0 text-fine text-ink-muted">
              {isPublished ? t.statusPublished : t.statusDraft}
            </span>
          </div>

          {/* Horizontal tab strip. It scrolls inside its own box on narrow
              screens rather than widening the page. */}
          <nav
            aria-label={t.tabs.outline}
            className="flex min-w-[200px] flex-1 gap-[22px] overflow-x-auto [&::-webkit-scrollbar]:h-0"
          >
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <Link
                  key={tab.key}
                  href={`/editor/modules/${moduleId}?tab=${tab.key}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'shrink-0 border-b-2 pt-3.5 pb-3 text-caption whitespace-nowrap transition-colors',
                    isActive
                      ? 'border-ink font-semibold text-ink'
                      : 'border-transparent text-ink-muted hover:text-ink',
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2.5 py-2">
            <Button
              variant="secondary"
              size="sm"
              render={<Link href={`/editor/modules/${moduleId}?tab=preview`} />}
            >
              {t.previewCta}
            </Button>
            <PublishForm moduleId={moduleId} isPublished={isPublished} t={publishFormT} />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-6 pt-12 pb-20 md:px-10 md:pt-14">
        {children}
      </div>

      <footer className="border-t border-hairline bg-parchment px-6 py-12 md:px-10">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap justify-between gap-6 text-fine text-ink-muted">
          <span>
            Kelas AI Studio · {title} · {isPublished ? t.statusPublished : t.statusDraft}
          </span>
          <span>{updatedAt}</span>
        </div>
      </footer>
    </div>
  );
}
