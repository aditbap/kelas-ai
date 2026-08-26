import { CaretRight } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils';

import { AddSessionForm } from './add-session-form';

type Lesson = {
  id: string;
  title: string;
  kind: string;
  contentType: string;
  content: string | null;
};
type Assignment = {
  id: string;
  instructions: string;
  submissionType: string;
  dueDate: Date | null;
  isAdvancedMaterial: boolean;
};
export type OutlineSession = {
  id: string;
  order: number;
  title: string;
  lessons: Lesson[];
  assignments: Assignment[];
};

type ItemKind = 'reading' | 'video' | 'file' | 'assignment';

/* Chip treatment per item kind, mirroring the design: media reads in the
   accent tint, prose reads quiet, and the graded item takes the solid dark
   chip that the design reserves for its assessed row. */
const CHIP: Record<ItemKind, string> = {
  video: 'bg-action/10 text-action',
  file: 'bg-action/10 text-action',
  reading: 'bg-parchment text-ink',
  assignment: 'bg-ink text-canvas',
};

function lessonKindOf(contentType: string): ItemKind {
  if (contentType === 'Video') return 'video';
  if (contentType === 'File') return 'file';
  return 'reading';
}

export function OutlineTab({
  moduleId,
  title,
  description,
  isPublished,
  sessions,
  t,
  lessonKindLabel,
  addSessionFormT,
}: {
  moduleId: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  sessions: OutlineSession[];
  t: Dictionary['editor']['studio'];
  lessonKindLabel: Dictionary['student']['moduleDetail']['lessonKindLabel'];
  addSessionFormT: Dictionary['editor']['moduleDetail']['addSessionForm'];
}) {
  const totalBlocks = sessions.reduce((sum, s) => sum + s.lessons.length, 0);
  const totalAssignments = sessions.reduce((sum, s) => sum + s.assignments.length, 0);
  const totalItems = totalBlocks + totalAssignments;

  // The design numbers every item once, continuously across the whole module,
  // so the counter has to run outside the per-session loop.
  let itemNumber = 0;

  const filledBlocks = sessions.reduce(
    (sum, s) => sum + s.lessons.filter((l) => l.content && l.content.trim()).length,
    0,
  );
  const sessionsWithContent = sessions.filter((s) => s.lessons.length > 0).length;

  const checks = [
    {
      ok: Boolean(description && description.trim()),
      label: t.checks.description,
      note:
        description && description.trim() ? t.checks.descriptionOk : t.checks.descriptionMissing,
    },
    {
      ok: sessions.length > 0 && sessionsWithContent === sessions.length,
      label: t.checks.sessionsHaveContent,
      note: t.checks.countOf(sessionsWithContent, sessions.length),
    },
    {
      ok: totalBlocks > 0 && filledBlocks === totalBlocks,
      label: t.checks.blocksFilled,
      note: t.checks.countOf(filledBlocks, totalBlocks),
    },
    {
      ok: totalAssignments > 0,
      label: t.checks.hasAssignment,
      note: totalAssignments > 0 ? t.checks.present : t.checks.none,
    },
  ];

  const stats = [
    { value: sessions.length, label: t.statSessions },
    { value: totalBlocks, label: t.statBlocks },
    { value: totalAssignments, label: t.statAssignments },
  ];

  return (
    <div className="flex flex-wrap items-start gap-x-12 gap-y-10">
      <div className="min-w-0 flex-[1_1_560px]">
        <p className="mb-3.5 text-fine tracking-wide text-ink-muted">{t.eyebrow(isPublished)}</p>
        <h1 className="mb-4 text-display-lg text-ink text-pretty">{title}</h1>
        <p
          className={cn(
            'mb-10 max-w-[640px] text-body',
            description ? 'text-ink' : 'text-ink-muted italic',
          )}
        >
          {description || t.noDescription}
        </p>

        <div className="mb-2 flex items-center justify-between gap-4 border-b border-hairline pb-3">
          <p className="text-caption font-semibold text-ink">
            {t.itemsSummary(totalItems, sessions.length)}
          </p>
        </div>

        {sessions.length === 0 ? (
          <p className="py-10 text-center text-caption text-ink-muted">{t.noSessions}</p>
        ) : (
          <div className="flex flex-col">
            {sessions.map((session) => {
              const items: {
                key: string;
                kind: ItemKind;
                title: string;
                meta: string;
                sub: string;
                needsContent: boolean;
              }[] = [
                ...session.lessons.map((lesson) => ({
                  key: `l-${lesson.id}`,
                  kind: lessonKindOf(lesson.contentType),
                  title: lesson.title,
                  meta: lessonKindLabel[lesson.kind as keyof typeof lessonKindLabel] ?? lesson.kind,
                  sub: lesson.content?.trim() ?? '',
                  needsContent: !lesson.content || !lesson.content.trim(),
                })),
                ...session.assignments.map((assignment) => ({
                  key: `a-${assignment.id}`,
                  kind: 'assignment' as const,
                  title: assignment.instructions,
                  meta: assignment.submissionType,
                  sub: assignment.dueDate
                    ? `${t.dueLabel} ${assignment.dueDate.toLocaleDateString()}`
                    : assignment.isAdvancedMaterial
                      ? t.itemState.advanced
                      : '',
                  needsContent: false,
                })),
              ];

              return (
                <section key={session.id} className="mt-6 first:mt-0">
                  <div className="flex items-center justify-between gap-4 py-2">
                    <p className="min-w-0 truncate text-fine font-semibold tracking-wide text-ink-muted">
                      {t.sessionEyebrow(session.order)} · {session.title}
                    </p>
                    <Link
                      href={`/editor/modules/${moduleId}?session=${session.id}`}
                      className="flex shrink-0 items-center gap-1 text-caption text-action hover:underline"
                    >
                      {t.open}
                      <CaretRight size={12} weight="bold" />
                    </Link>
                  </div>

                  {items.length === 0 ? (
                    <p className="border-t border-divider-soft py-5 text-caption text-ink-muted">
                      {t.noItemsInSession}
                    </p>
                  ) : (
                    items.map((item) => {
                      itemNumber += 1;
                      return (
                        <Link
                          key={item.key}
                          href={`/editor/modules/${moduleId}?session=${session.id}`}
                          className="flex items-start gap-4 rounded-sm border-b border-divider-soft py-5 pr-4 pl-2 transition-colors hover:bg-pearl"
                        >
                          <span
                            className={cn(
                              'flex size-[26px] shrink-0 items-center justify-center rounded-full text-fine font-semibold',
                              CHIP[item.kind],
                            )}
                          >
                            {itemNumber}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="mb-1.5 flex flex-wrap items-center gap-2.5">
                              <span className="text-fine font-semibold tracking-wide text-ink-muted uppercase">
                                {t.itemKind[item.kind]}
                              </span>
                              <span className="text-fine text-ink-faint">·</span>
                              <span className="text-fine text-ink-muted">{item.meta}</span>
                            </span>
                            <span className="mb-1.5 block text-body font-semibold text-ink text-pretty">
                              {item.title}
                            </span>
                            {item.sub ? (
                              <span className="block text-caption text-ink-muted line-clamp-2">
                                {item.sub}
                              </span>
                            ) : null}
                          </span>

                          <span
                            className={cn(
                              'shrink-0 text-fine',
                              item.needsContent ? 'text-action' : 'text-ink-muted',
                            )}
                          >
                            {item.needsContent ? t.itemState.needsContent : t.itemState.ready}
                          </span>
                        </Link>
                      );
                    })
                  )}
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-8 max-w-sm">
          <AddSessionForm moduleId={moduleId} t={addSessionFormT} />
        </div>
      </div>

      <aside className="flex w-full flex-[0_1_320px] flex-col gap-5 lg:w-auto">
        <div className="rounded-lg border border-hairline p-6">
          <h2 className="mb-4.5 text-body font-semibold text-ink">{t.readiness}</h2>
          <ul className="flex flex-col gap-3.5">
            {checks.map((check) => (
              <li key={check.label} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={cn(
                    'mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full text-[11px] leading-none',
                    check.ok ? 'bg-ink text-canvas' : 'bg-action text-white',
                  )}
                >
                  {check.ok ? '✓' : '!'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-caption text-ink">{check.label}</span>
                  <span className="block text-fine text-ink-muted">{check.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-hairline p-6">
          <h2 className="mb-4 text-body font-semibold text-ink">{t.contentStats}</h2>
          <div className="flex flex-col gap-3.5">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-lead font-semibold text-ink">{stat.value}</p>
                <p className="text-fine text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
