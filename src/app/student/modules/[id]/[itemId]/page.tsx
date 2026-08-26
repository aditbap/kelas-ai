import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getTranslations } from '@/lib/i18n/get-locale';

import { completeLessonAndAdvanceAction } from '../../actions';
import { CourseOutline } from '../course-outline';
import { loadModulePlayerData } from '../data';
import { SubmitAssignmentForm } from '../submit-assignment-form';

export default async function ModuleItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const { t } = await getTranslations();
  const s = t.student.modules;
  const d = t.student.moduleDetail;

  const result = await loadModulePlayerData(id);

  if (result.status === 'not-found') notFound();

  if (result.status === 'no-access') {
    return (
      <div className="max-w-2xl">
        <h1 className="text-display-md">{s.title}</h1>
        <div className="mt-6 rounded-lg border border-hairline bg-parchment p-6 text-caption">
          <p className="font-medium text-ink">{d.getAllAccessToUnlockThis}</p>
          <div className="mt-4">
            <Button render={<Link href="/student/checkout">{s.getAllAccessCta}</Link>} />
          </div>
        </div>
      </div>
    );
  }

  if (result.status === 'locked') {
    return (
      <div className="max-w-3xl">
        <h1 className="text-display-md">{result.moduleTitle}</h1>
        <div className="mt-6 rounded-lg border border-hairline bg-parchment p-5 text-caption">
          <p className="font-medium text-ink">{d.lockedTitle}</p>
          <p className="mt-1 text-ink-muted">
            {d.lockedDescription.replace('{title}', result.prerequisiteTitle ?? '')}
          </p>
        </div>
      </div>
    );
  }

  const { data } = result;
  const currentIndex = data.items.findIndex((item) => item.itemId === itemId);
  if (currentIndex === -1) notFound();

  const current = data.items[currentIndex];
  const nextItem = data.items[currentIndex + 1] ?? null;
  const nextHref = nextItem ? `/student/modules/${id}/${nextItem.itemId}` : '/student/modules';
  const nextLabel = nextItem ? d.goToNextItem : d.backToModules;

  return (
    <div className="lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-8">
      <CourseOutline
        moduleId={id}
        moduleTitle={data.module.title}
        overallPercent={data.overallPercent}
        sessions={data.sessions}
        items={data.items}
        currentItemId={itemId}
        t={d}
      />

      <main className="mt-8 min-w-0 lg:mt-0">
        <div className="rounded-lg border border-hairline p-6">
          <p className="text-fine font-semibold tracking-wide text-ink-muted uppercase">
            {current.type === 'assignment'
              ? d.assignmentItemLabel
              : d.contentTypeLabel[current.contentType as keyof typeof d.contentTypeLabel]}
          </p>
          <h1 className="mt-1 text-display-md">
            {current.type === 'assignment' ? current.instructions : current.title}
          </h1>

          {current.type === 'lesson' ? (
            <>
              <p className="mt-1 text-fine font-medium text-ink-muted">
                {d.lessonKindLabel[current.kind as keyof typeof d.lessonKindLabel]}
              </p>
              {current.content ? (
                current.contentType === 'Text' ? (
                  <p className="mt-6 text-caption whitespace-pre-wrap text-ink">
                    {current.content}
                  </p>
                ) : (
                  <a
                    href={current.content}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-action px-4 py-2 text-caption font-medium text-white hover:opacity-90"
                  >
                    {d.open.replace('{type}', current.contentType.toLowerCase())}
                  </a>
                )
              ) : null}
            </>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-fine text-ink-muted">
                <span>{current.submissionType}</span>
                {current.dueDate ? (
                  <span>
                    {d.dueLabel} {current.dueDate.toLocaleDateString()}
                  </span>
                ) : null}
                {current.isAdvancedMaterial ? (
                  <span className="font-medium text-action">{d.advancedMaterial}</span>
                ) : null}
              </div>

              {current.submission?.grade ? (
                <div className="rounded-md bg-action/10 p-4 text-caption">
                  <p className="font-medium text-action">
                    {d.graded}
                    {current.submission.grade.score != null
                      ? `: ${current.submission.grade.score}`
                      : ''}
                    {current.submission.grade.passFail != null
                      ? ` (${current.submission.grade.passFail ? d.pass : d.fail})`
                      : ''}
                  </p>
                  {current.submission.grade.feedbackText ? (
                    <p className="mt-1 text-ink-muted">{current.submission.grade.feedbackText}</p>
                  ) : null}
                </div>
              ) : (
                <SubmitAssignmentForm
                  assignmentId={current.assignmentId}
                  submissionType={current.submissionType}
                  existingContent={current.submission?.content}
                />
              )}
            </div>
          )}

          <div className="mt-8 flex justify-end border-t border-hairline pt-6">
            {current.type === 'lesson' && current.isNextInOrder && !current.completed ? (
              <form action={completeLessonAndAdvanceAction}>
                <input type="hidden" name="sessionId" value={current.sessionId} />
                <input type="hidden" name="nextHref" value={nextHref} />
                <Button type="submit">{nextLabel}</Button>
              </form>
            ) : (
              <Button render={<Link href={nextHref}>{nextLabel}</Link>} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
