import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export default async function ProgressPage() {
  const session = await requireRole(Role.Employee);

  const records = await prisma.progressRecord.findMany({
    where: { userId: session.userId },
    include: { module: { include: { lessons: true } } },
    orderBy: { lastActivityAt: 'desc' },
  });

  const overallPercent =
    records.length === 0
      ? 0
      : Math.round(
          (records.filter((record) => record.assignmentStatus === 'Graded').length /
            records.length) *
            100,
        );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">My Progress</h1>
      <p className="mt-2 text-muted-foreground">{overallPercent}% of your modules completed.</p>

      <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
        {records.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            No activity yet — start a module to see progress here.
          </li>
        ) : (
          records.map((record) => (
            <li key={record.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{record.module.title}</p>
                <p className="text-xs text-muted-foreground">
                  {record.lessonsCompletedCount}/{record.module.lessons.length} lessons ·{' '}
                  {record.assignmentStatus}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {record.lastActivityAt.toLocaleDateString()}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
