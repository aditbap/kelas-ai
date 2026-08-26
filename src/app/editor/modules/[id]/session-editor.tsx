import { CaretLeft } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils';

import { AddAssignmentForm } from './add-assignment-form';
import { AddLessonForm } from './add-lesson-form';
import type { OutlineSession } from './outline-tab';

/*
  The design's item-editor screen: a focused authoring column with a back link
  to the outline, and a quiet rail on the right. The design's rail holds
  per-item settings; this module's sessions carry no settings of their own, so
  the rail is given the job it can actually do — jumping between sessions
  without a round trip through the outline.
*/
export function SessionEditor({
  moduleId,
  session,
  allSessions,
  t,
  moduleDetailT,
  lessonKindLabel,
}: {
  moduleId: string;
  session: OutlineSession;
  allSessions: { id: string; order: number; title: string }[];
  t: Dictionary['editor']['studio'];
  moduleDetailT: Dictionary['editor']['moduleDetail'];
  lessonKindLabel: Dictionary['student']['moduleDetail']['lessonKindLabel'];
}) {
  return (
    <div className="flex flex-wrap items-start gap-x-12 gap-y-10">
      <div className="min-w-0 flex-[1_1_600px]">
        <Link
          href={`/editor/modules/${moduleId}`}
          className="mb-5 inline-flex items-center gap-1 text-caption text-action hover:underline"
        >
          <CaretLeft size={12} weight="bold" />
          {t.backToOutline}
        </Link>

        <p className="mb-2 text-fine font-semibold tracking-wide text-ink-muted">
          {t.sessionEyebrow(session.order)}
        </p>
        <h1 className="mb-10 text-display-md text-ink text-pretty">{session.title}</h1>

        <section>
          <h2 className="text-caption font-semibold text-ink-muted">
            {moduleDetailT.contentBlocksHeading(session.lessons.length)}
          </h2>
          <ul className="mt-2 divide-y divide-hairline rounded-md border border-hairline">
            {session.lessons.length === 0 ? (
              <li className="px-4 py-3 text-caption text-ink-muted">
                {moduleDetailT.noContentBlocks}
              </li>
            ) : (
              session.lessons.map((lesson, index) => (
                <li key={lesson.id} className="px-4 py-3">
                  <p className="text-caption font-medium text-ink">
                    {index + 1}. {lesson.title}
                  </p>
                  <p className="mt-0.5 text-fine text-ink-muted">
                    {lessonKindLabel[lesson.kind as keyof typeof lessonKindLabel] ?? lesson.kind} ·{' '}
                    {lesson.contentType}
                  </p>
                  {lesson.content?.trim() ? (
                    <p className="mt-1 text-fine text-ink-muted line-clamp-2">{lesson.content}</p>
                  ) : (
                    <p className="mt-1 text-fine text-action">{t.itemState.needsContent}</p>
                  )}
                </li>
              ))
            )}
          </ul>
          <div className="mt-3 max-w-sm">
            <AddLessonForm
              sessionId={session.id}
              t={moduleDetailT.addLessonForm}
              lessonKindLabel={lessonKindLabel}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-caption font-semibold text-ink-muted">
            {moduleDetailT.assignmentsHeading(session.assignments.length)}
          </h2>
          <ul className="mt-2 divide-y divide-hairline rounded-md border border-hairline">
            {session.assignments.length === 0 ? (
              <li className="px-4 py-3 text-caption text-ink-muted">
                {moduleDetailT.noAssignments}
              </li>
            ) : (
              session.assignments.map((assignment) => (
                <li key={assignment.id} className="px-4 py-3">
                  <p className="text-caption font-medium text-ink">{assignment.instructions}</p>
                  <p className="mt-0.5 text-fine text-ink-muted">
                    {assignment.submissionType}
                    {assignment.dueDate
                      ? ` ${moduleDetailT.dueLabel} ${assignment.dueDate.toLocaleDateString()}`
                      : ''}
                    {assignment.isAdvancedMaterial ? moduleDetailT.advancedMaterialSuffix : ''}
                  </p>
                </li>
              ))
            )}
          </ul>
          <div className="mt-3 max-w-sm">
            <AddAssignmentForm sessionId={session.id} t={moduleDetailT.addAssignmentForm} />
          </div>
        </section>
      </div>

      <aside className="w-full flex-[0_1_320px] rounded-lg border border-hairline bg-pearl p-6 lg:w-auto">
        <h2 className="mb-4 text-body font-semibold text-ink">{moduleDetailT.curriculum}</h2>
        <ol className="flex flex-col gap-1">
          {allSessions.map((other) => {
            const isCurrent = other.id === session.id;
            return (
              <li key={other.id}>
                <Link
                  href={`/editor/modules/${moduleId}?session=${other.id}`}
                  aria-current={isCurrent ? 'true' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2.5 transition-colors',
                    isCurrent
                      ? 'bg-elevated shadow-[0_0_0_1px_var(--hairline)]'
                      : 'hover:bg-parchment',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-fine font-semibold',
                      isCurrent ? 'bg-action text-white' : 'bg-parchment text-ink-muted',
                    )}
                  >
                    {other.order}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-caption text-ink">
                    {other.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
