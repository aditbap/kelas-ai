import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export default async function InstructorDashboardPage() {
  const session = await requireRole(Role.Instructor);

  const assignments = await prisma.instructorTenantAssignment.findMany({
    where: { instructorId: session.userId },
    include: { tenant: true },
  });
  const tenantIds = assignments.map((assignment) => assignment.tenantId);

  const pendingSubmissions = await prisma.submission.findMany({
    where: {
      status: 'Pending',
      assignment: {
        module: { publications: { some: { cohort: { tenantId: { in: tenantIds } } } } },
      },
    },
    include: { user: true, assignment: { include: { module: true } } },
    orderBy: { submittedAt: 'asc' },
    take: 10,
  });

  const modules = await prisma.module.findMany({
    where: { createdByInstructorId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content & grading dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Assigned to {assignments.length} tenant{assignments.length === 1 ? '' : 's'} ·{' '}
          {pendingSubmissions.length} submission{pendingSubmissions.length === 1 ? '' : 's'}{' '}
          awaiting grading
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground">Assigned tenants</h2>
        {assignments.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No tenants assigned yet.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="rounded-full border border-border px-3 py-1 text-sm"
              >
                {assignment.tenant.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground">Grading queue</h2>
        {pendingSubmissions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing pending — you&apos;re caught up.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
            {pendingSubmissions.map((submission) => (
              <li key={submission.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{submission.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {submission.assignment.module.title}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {submission.submittedAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground">Your modules</h2>
        {modules.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            You haven&apos;t authored any modules yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
            {modules.map((module) => (
              <li key={module.id} className="px-4 py-3">
                <p className="text-sm font-medium">{module.title}</p>
                {module.description ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{module.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
