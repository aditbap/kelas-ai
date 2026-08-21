import { notFound } from 'next/navigation';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import { removeCohortMemberAction } from '../actions';
import { AddMemberForm } from './add-member-form';

export default async function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(Role.CompanyAdmin);
  const { id } = await params;

  const cohort = await prisma.cohort.findFirst({
    where: { id, tenantId: session.tenantId ?? '__none__' },
    include: {
      instructor: true,
      members: { include: { user: true }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!cohort) notFound();

  const memberIds = new Set(cohort.members.map((member) => member.userId));
  const candidates = await prisma.user.findMany({
    where: { tenantId: session.tenantId, role: Role.Employee, id: { notIn: [...memberIds] } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">{cohort.name}</h1>
      <p className="mt-1 text-muted-foreground">
        {cohort.onsiteDate.toLocaleDateString(undefined, { dateStyle: 'long' })} · Instructor:{' '}
        {cohort.instructor.name}
      </p>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground">Add employee</h2>
        <div className="mt-2">
          <AddMemberForm cohortId={cohort.id} candidates={candidates} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Members ({cohort.members.length})
        </h2>
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
          {cohort.members.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">
              No employees assigned yet.
            </li>
          ) : (
            cohort.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
                <form action={removeCohortMemberAction}>
                  <input type="hidden" name="cohortId" value={cohort.id} />
                  <input type="hidden" name="userId" value={member.userId} />
                  <button
                    type="submit"
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
