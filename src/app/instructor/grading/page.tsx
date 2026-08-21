import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import { GradeForm } from './grade-form';

export default async function GradingQueuePage() {
  const session = await requireRole(Role.Instructor);

  const submissions = await prisma.submission.findMany({
    where: {
      status: 'Pending',
      assignment: {
        module: {
          publications: {
            some: {
              cohort: {
                tenant: { instructorTenantAssignments: { some: { instructorId: session.userId } } },
              },
            },
          },
        },
      },
    },
    include: { user: true, assignment: { include: { module: true } } },
    orderBy: { submittedAt: 'asc' },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Grading Queue</h1>
      <p className="mt-2 text-muted-foreground">
        {submissions.length} submission{submissions.length === 1 ? '' : 's'} awaiting grading across
        your assigned tenants.
      </p>

      <ul className="mt-8 space-y-4">
        {submissions.length === 0 ? (
          <li className="rounded-lg border border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing pending — you&apos;re caught up.
          </li>
        ) : (
          submissions.map((submission) => (
            <li key={submission.id} className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium">
                {submission.user.name} · {submission.assignment.module.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {submission.assignment.instructions}
              </p>
              <p className="mt-2 rounded-md bg-muted/40 p-2 text-sm">{submission.content}</p>
              <GradeForm submissionId={submission.id} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
