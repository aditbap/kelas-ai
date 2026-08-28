import { CheckCircle, Circle, PaperPlaneTilt, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { hasAllAccess } from '@/lib/access';
import { Button } from '@/components/ui/button';
import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { getModuleCompletionPercent, isModuleUnlockedForUser } from '@/lib/module-completion';
import { requireRole } from '@/lib/session';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'notStarted' | 'submitted' | 'graded';

function parseStatusFilter(value: string | undefined): StatusFilter {
  return value === 'notStarted' || value === 'submitted' || value === 'graded' ? value : 'all';
}

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireRole(Role.Student);
  const { t } = await getTranslations();
  const s = t.student.assignments;
  const { status } = await searchParams;
  const activeStatus = parseStatusFilter(status);

  if (!(await hasAllAccess(session.userId))) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-display-md">{s.title}</h1>
        <div className="mt-6 rounded-lg border border-hairline bg-parchment p-6 text-caption">
          <p className="font-medium text-ink">{s.getAllAccessTitle}</p>
          <div className="mt-4">
            <Button render={<Link href="/student/checkout">{s.getAllAccessCta}</Link>} />
          </div>
        </div>
      </div>
    );
  }

  const assignments = await prisma.assignment.findMany({
    where: { session: { module: { isPublished: true } } },
    include: {
      session: { include: { module: true } },
      submissions: { where: { userId: session.userId }, include: { grade: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  const entries = assignments.map((assignment) => {
    const submission = assignment.submissions[0];
    const statusKey: StatusFilter = submission?.grade
      ? 'graded'
      : submission
        ? 'submitted'
        : 'notStarted';
    const isOverdue = !submission && !!assignment.dueDate && assignment.dueDate < now;
    return { assignment, submission, statusKey, isOverdue };
  });

  // Only show assignments from modules the student has actually reached (unlocked),
  // grouped so "to do / submitted / graded" line up with each module's own progress.
  const moduleIds = [...new Set(entries.map((entry) => entry.assignment.session.module.id))];
  const moduleMeta = new Map(
    await Promise.all(
      moduleIds.map(async (moduleId) => {
        const mod = entries.find((e) => e.assignment.session.module.id === moduleId)!.assignment
          .session.module;
        const [percent, unlocked] = await Promise.all([
          getModuleCompletionPercent(session.userId, moduleId),
          isModuleUnlockedForUser(session.userId, mod),
        ]);
        return [moduleId, { percent, unlocked }] as const;
      }),
    ),
  );

  const reached = entries.filter(
    (entry) => moduleMeta.get(entry.assignment.session.module.id)?.unlocked,
  );
  const filtered =
    activeStatus === 'all' ? reached : reached.filter((entry) => entry.statusKey === activeStatus);

  const groupedModuleIds = [
    ...new Set(filtered.map((entry) => entry.assignment.session.module.id)),
  ].sort((a, b) => (moduleMeta.get(a)?.percent ?? 0) - (moduleMeta.get(b)?.percent ?? 0));

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: s.filterAll },
    { key: 'notStarted', label: s.filterNotStarted },
    { key: 'submitted', label: s.filterSubmitted },
    { key: 'graded', label: s.filterGraded },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-display-md">{s.title}</h1>
      <p className="mt-2 text-ink-muted">{s.subtitle}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.key}
            href={
              filter.key === 'all'
                ? '/student/assignments'
                : `/student/assignments?status=${filter.key}`
            }
            className={cn(
              'rounded-full border px-3 py-1 text-fine font-medium transition-colors',
              activeStatus === filter.key
                ? 'border-action bg-action text-white'
                : 'border-hairline text-ink-muted hover:text-ink',
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-lg border border-hairline px-4 py-6 text-center text-caption text-ink-muted">
          {s.none}
        </div>
      ) : (
        groupedModuleIds.map((moduleId) => {
          const moduleEntries = filtered.filter(
            (entry) => entry.assignment.session.module.id === moduleId,
          );
          const meta = moduleMeta.get(moduleId);
          const isModuleComplete = (meta?.percent ?? 0) >= 100;
          return (
            <div key={moduleId} className="mt-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-caption font-medium text-ink">
                  {moduleEntries[0].assignment.session.module.title}
                </h2>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-fine font-medium',
                    isModuleComplete
                      ? 'border-transparent bg-action/10 text-action'
                      : 'border-hairline text-ink-muted',
                  )}
                >
                  {isModuleComplete ? s.moduleCompleted : s.moduleInProgress}
                </span>
              </div>
              <ul className="mt-2 divide-y divide-hairline rounded-lg border border-hairline">
                {moduleEntries.map(({ assignment, submission, statusKey, isOverdue }) => (
                  <li
                    key={assignment.id}
                    className="flex items-start justify-between gap-4 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/student/modules/${assignment.session.moduleId}/a-${assignment.id}`}
                        className="text-caption font-medium hover:underline"
                      >
                        {assignment.instructions}
                      </Link>
                      <p className="mt-0.5 text-fine text-ink-muted">
                        {assignment.session.module.title}
                        {assignment.isAdvancedMaterial ? s.advancedMaterialSuffix : ''}
                      </p>
                      {assignment.dueDate || submission?.grade ? (
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-fine text-ink-muted">
                          {assignment.dueDate ? (
                            <span className={cn(isOverdue && 'font-medium text-destructive')}>
                              {s.dueLabel} {assignment.dueDate.toLocaleDateString()}
                            </span>
                          ) : null}
                          {submission?.grade ? (
                            <span>
                              {submission.grade.score != null ? submission.grade.score : null}
                              {submission.grade.passFail != null
                                ? ` (${submission.grade.passFail ? s.pass : s.fail})`
                                : ''}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-fine font-medium',
                        statusKey === 'graded' && 'border-transparent bg-action/10 text-action',
                        statusKey === 'submitted' && 'border-hairline text-ink-muted',
                        statusKey === 'notStarted' &&
                          (isOverdue
                            ? 'border-destructive/30 text-destructive'
                            : 'border-hairline text-ink-muted'),
                      )}
                    >
                      {statusKey === 'graded' ? (
                        <CheckCircle weight="fill" className="h-3.5 w-3.5" />
                      ) : statusKey === 'submitted' ? (
                        <PaperPlaneTilt className="h-3.5 w-3.5" />
                      ) : isOverdue ? (
                        <WarningCircle weight="fill" className="h-3.5 w-3.5" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                      {statusKey === 'graded'
                        ? s.statusGraded
                        : statusKey === 'submitted'
                          ? s.statusSubmitted
                          : isOverdue
                            ? s.overdue
                            : s.statusNotStarted}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}
