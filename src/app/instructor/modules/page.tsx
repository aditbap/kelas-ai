import Link from 'next/link';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import { CreateModuleForm } from './create-module-form';

export default async function ModulesPage() {
  const session = await requireRole(Role.Instructor);

  const modules = await prisma.module.findMany({
    where: { createdByInstructorId: session.userId },
    include: { lessons: true, assignments: true, publications: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Content Library</h1>
      <p className="mt-2 text-muted-foreground">
        Author modules, add lessons and assignments, then publish to a cohort.
      </p>

      <div className="mt-8 max-w-sm">
        <CreateModuleForm />
      </div>

      <ul className="mt-10 divide-y divide-border rounded-lg border border-border">
        {modules.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            No modules yet — create one above.
          </li>
        ) : (
          modules.map((module) => (
            <li key={module.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link
                  href={`/instructor/modules/${module.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {module.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {module.lessons.length} lesson{module.lessons.length === 1 ? '' : 's'} ·{' '}
                  {module.assignments.length} assignment
                  {module.assignments.length === 1 ? '' : 's'} · published to{' '}
                  {module.publications.length} cohort{module.publications.length === 1 ? '' : 's'}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
