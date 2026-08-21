import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export default async function EmployeeDashboardPage() {
  const session = await requireRole(Role.Employee);

  const membership = await prisma.cohortMember.findFirst({
    where: { userId: session.userId },
    include: { cohort: { include: { instructor: true } } },
  });

  const publications = membership
    ? await prisma.moduleCohortPublication.findMany({
        where: { cohortId: membership.cohortId },
        include: { module: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
    : [];

  const progressRecords = await prisma.progressRecord.findMany({
    where: { userId: session.userId },
  });
  const progressByModule = new Map(progressRecords.map((record) => [record.moduleId, record]));

  const completedCount = progressRecords.filter(
    (record) => record.assignmentStatus === 'Graded',
  ).length;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {session.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {progressRecords.length > 0
            ? `${completedCount} of ${progressRecords.length} modules completed.`
            : 'No modules assigned yet — check back after your onsite session.'}
        </p>
      </div>

      <div className="rounded-lg border border-border p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Upcoming onsite session</h2>
        {membership ? (
          <div className="mt-2">
            <p className="text-lg font-medium">{membership.cohort.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {membership.cohort.onsiteDate.toLocaleDateString(undefined, {
                dateStyle: 'long',
              })}{' '}
              · Instructor: {membership.cohort.instructor.name}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;re not assigned to a cohort yet.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground">Recently assigned modules</h2>
        {publications.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing assigned yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
            {publications.map(({ module }) => {
              const progress = progressByModule.get(module.id);
              return (
                <li key={module.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{module.title}</p>
                    {module.description ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{module.description}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {progress?.assignmentStatus ?? 'NotStarted'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
