import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export default async function MyCohortPage() {
  const session = await requireRole(Role.Employee);

  const membership = await prisma.cohortMember.findFirst({
    where: { userId: session.userId },
    include: {
      cohort: {
        include: { instructor: true, members: { include: { user: true } } },
      },
    },
  });

  if (!membership) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">My Cohort</h1>
        <p className="mt-2 text-muted-foreground">You&apos;re not assigned to a cohort yet.</p>
      </div>
    );
  }

  const { cohort } = membership;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">{cohort.name}</h1>
      <p className="mt-1 text-muted-foreground">
        {cohort.onsiteDate.toLocaleDateString(undefined, { dateStyle: 'long' })} · Instructor:{' '}
        {cohort.instructor.name}
      </p>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Teammates ({cohort.members.length})
        </h2>
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
          {cohort.members.map((member) => (
            <li key={member.id} className="px-4 py-3 text-sm">
              {member.user.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
