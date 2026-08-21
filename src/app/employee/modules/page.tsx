import Link from 'next/link';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export default async function ModulesPage() {
  const session = await requireRole(Role.Employee);

  const publications = await prisma.moduleCohortPublication.findMany({
    where: { cohort: { members: { some: { userId: session.userId } } } },
    include: { module: true },
    distinct: ['moduleId'],
    orderBy: { createdAt: 'desc' },
  });

  const progressRecords = await prisma.progressRecord.findMany({
    where: { userId: session.userId },
  });
  const progressByModule = new Map(progressRecords.map((record) => [record.moduleId, record]));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Learning Modules</h1>
      <p className="mt-2 text-muted-foreground">Everything published to your cohort.</p>

      <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
        {publications.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing published to your cohort yet.
          </li>
        ) : (
          publications.map(({ module }) => {
            const progress = progressByModule.get(module.id);
            return (
              <li key={module.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link
                    href={`/employee/modules/${module.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {module.title}
                  </Link>
                  {module.description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{module.description}</p>
                  ) : null}
                </div>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {progress?.lessonsCompletedCount ?? 0} lessons done
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
