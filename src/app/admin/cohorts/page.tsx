import Link from 'next/link';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import { CreateCohortForm } from './create-cohort-form';

export default async function CohortsPage() {
  const session = await requireRole(Role.CompanyAdmin);

  const [cohorts, assignments] = await Promise.all([
    prisma.cohort.findMany({
      where: { tenantId: session.tenantId ?? '__none__' },
      include: { instructor: true, members: true },
      orderBy: { onsiteDate: 'desc' },
    }),
    prisma.instructorTenantAssignment.findMany({
      where: { tenantId: session.tenantId ?? '__none__' },
      include: { instructor: true },
    }),
  ]);

  const instructors = assignments.map((assignment) => ({
    id: assignment.instructor.id,
    name: assignment.instructor.name,
  }));

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Cohorts</h1>
      <p className="mt-2 text-muted-foreground">
        Onsite training batches — schedule one, then assign employees and content to it.
      </p>

      <div className="mt-8 max-w-sm">
        <CreateCohortForm instructors={instructors} />
      </div>

      <ul className="mt-10 divide-y divide-border rounded-lg border border-border">
        {cohorts.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            No cohorts yet — create one above.
          </li>
        ) : (
          cohorts.map((cohort) => (
            <li key={cohort.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link
                  href={`/admin/cohorts/${cohort.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {cohort.name}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cohort.onsiteDate.toLocaleDateString(undefined, { dateStyle: 'medium' })} ·{' '}
                  {cohort.instructor.name} · {cohort.members.length} member
                  {cohort.members.length === 1 ? '' : 's'}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
