import { FilePdf, Play } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils';

import type { OutlineSession } from './outline-tab';

/*
  The design's "student preview" screen: the module rendered as a fresh
  student first meets it, on a parchment stage so it reads as a preview rather
  than the real thing. The action buttons are deliberately inert — the design
  labels this view as not affecting data, so they illustrate the student's
  controls without being wired to them.

  The desktop/phone toggle is real: it narrows the preview stage to a phone
  width via the `device` search param, so an editor can check how their copy
  wraps before publishing.
*/
export function PreviewTab({
  moduleId,
  moduleTitle,
  description,
  prerequisiteTitle,
  sessions,
  device,
  t,
}: {
  moduleId: string;
  moduleTitle: string;
  description: string | null;
  prerequisiteTitle: string | null;
  sessions: OutlineSession[];
  device: 'desktop' | 'phone';
  t: Dictionary['editor']['studio'];
}) {
  const totalItems = sessions.reduce((sum, s) => sum + s.lessons.length + s.assignments.length, 0);
  const firstSession = sessions.find((s) => s.lessons.length > 0);
  const firstLesson = firstSession?.lessons[0] ?? null;

  return (
    <div className="-mx-6 -mt-12 bg-parchment px-6 pt-10 pb-20 md:-mx-10 md:-mt-14 md:px-10">
      <div className={cn('mx-auto', device === 'phone' ? 'max-w-[420px]' : 'max-w-[980px]')}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-fine tracking-wide text-ink-muted">{t.previewNotice}</p>
          <div className="flex shrink-0 gap-2">
            {(['desktop', 'phone'] as const).map((option) => (
              <Link
                key={option}
                href={`/editor/modules/${moduleId}?tab=preview&device=${option}`}
                aria-current={device === option ? 'true' : undefined}
                className={cn(
                  'rounded-full bg-elevated px-3.5 py-2 text-caption transition-colors',
                  device === option
                    ? 'border-2 border-action-focus text-ink'
                    : 'border border-hairline text-ink-muted hover:text-ink',
                )}
              >
                {option === 'desktop' ? 'Desktop' : 'Phone'}
              </Link>
            ))}
          </div>
        </div>

        {prerequisiteTitle ? (
          <div className="mb-5 rounded-lg border border-hairline bg-elevated px-5 py-4 text-caption text-ink-muted">
            {t.previewLocked}
          </div>
        ) : null}

        {totalItems === 0 || !firstLesson ? (
          <div className="rounded-lg border border-hairline bg-elevated p-12 text-center text-caption text-ink-muted">
            {t.previewEmpty}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-hairline bg-elevated">
            <div className="border-b border-divider-soft p-8 md:p-12">
              <p className="mb-2.5 text-fine tracking-wide text-ink-muted">
                {t.previewItemCount(1, totalItems)}
              </p>
              <h2 className="mb-5 text-display-md text-ink text-pretty md:text-display-lg">
                {firstLesson.title}
              </h2>
              <div className="h-1 max-w-[420px] overflow-hidden rounded-full bg-divider-soft">
                <div className="h-1 rounded-full bg-action" style={{ width: '0%' }} />
              </div>
              <p className="mt-2 text-fine text-ink-muted">{t.previewProgress}</p>
            </div>

            {firstLesson.contentType === 'Text' ? null : (
              <div className="flex aspect-video items-center justify-center bg-parchment">
                <span className="flex size-14 items-center justify-center rounded-full bg-[#d2d2d7]/64 text-ink">
                  {firstLesson.contentType === 'Video' ? (
                    <Play size={20} weight="fill" />
                  ) : (
                    <FilePdf size={20} />
                  )}
                </span>
              </div>
            )}

            <div className="p-8 md:p-12">
              <p className="mb-7 max-w-[640px] text-body whitespace-pre-wrap text-ink">
                {firstLesson.content?.trim() || description || moduleTitle}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled>{t.previewMarkDone}</Button>
                <Button variant="outline" disabled>
                  {t.previewNext}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
