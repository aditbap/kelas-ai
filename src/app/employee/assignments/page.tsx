import Link from 'next/link';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export default async function AssignmentsPage() {
  const session = await requireRole(Role.Employee);

  const assignments = await prisma.assignment.findMany({
    where: {
      module: {
        publications: { some: { cohort: { members: { some: { userId: session.userId } } } } },
      },
    },
    include: {
      module: true,
      submissions: { where: { userId: session.userId }, include: { grade: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
      <p className="mt-2 text-muted-foreground">Everything assigned across your modules.</p>

      <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
        {assignments.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            No assignments yet.
          </li>
        ) : (
          assignments.map((assignment) => {
            const submission = assignment.submissions[0];
            const status = submission?.grade ? 'Graded' : submission ? 'Submitted' : 'Not started';
            return (
              <li key={assignment.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link
                    href={`/employee/modules/${assignment.moduleId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {assignment.instructions}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{assignment.module.title}</p>
                </div>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {status}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
