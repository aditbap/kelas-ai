import { CheckCircle, Circle, PaperPlaneTilt, WarningCircle } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { hasAllAccess } from '@/lib/access';
import { Button } from '@/components/ui/button';
import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
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

  const filtered =
    activeStatus === 'all' ? entries : entries.filter((entry) => entry.statusKey === activeStatus);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: s.filterAll },
    { key: 'notStarted', label: s.filterNotStarted },
    { key: 'submitted', label: s.filterSubmitted },
    { key: 'graded', label: s.filterGraded },
  ];

  return (
    <div className="max-w-3xl">
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

      <ul className="mt-4 divide-y divide-hairline rounded-lg border border-hairline">
        {filtered.length === 0 ? (
          <li className="px-4 py-6 text-center text-caption text-ink-muted">{s.none}</li>
        ) : (
          filtered.map(({ assignment, submission, statusKey, isOverdue }) => (
            <li key={assignment.id} className="flex items-start justify-between gap-4 px-4 py-3">
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
          ))
        )}
      </ul>
    </div>
  );
}
