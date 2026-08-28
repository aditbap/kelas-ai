import { notFound } from 'next/navigation';

import { getAllAccessStudentIds } from '@/lib/access';
import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { requireRole } from '@/lib/session';

import { AddMemberForm } from './add-member-form';
import { DeleteCohortForm } from './delete-cohort-form';
import { EditCohortForm } from './edit-cohort-form';
import { RemoveMemberForm } from './remove-member-form';

export default async function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(Role.Editor);
  const { id } = await params;
  const { t } = await getTranslations();
  const s = t.editor.cohorts;
  const d = s.detail;

  const cohort = await prisma.cohort.findFirst({
    where: { id, editorId: session.userId },
    include: { members: { include: { user: true } } },
  });
  if (!cohort) notFound();

  const paidStudentIds = await getAllAccessStudentIds(
    cohort.members.map((member) => member.userId),
  );

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-display-md">{cohort.name}</h1>
        <p className="mt-1 text-ink-muted">
          {s.onsitePrefix} {cohort.onsiteDate.toLocaleDateString()}
        </p>
      </div>

      <div className="rounded-lg border border-hairline p-4">
        <EditCohortForm
          cohortId={cohort.id}
          name={cohort.name}
          onsiteDate={cohort.onsiteDate}
          t={s.createForm}
        />
      </div>

      <div>
        <h2 className="text-caption font-semibold text-ink-muted">
          {d.studentsHeading(cohort.members.length)}
        </h2>
        <ul className="mt-2 divide-y divide-hairline rounded-lg border border-hairline">
          {cohort.members.length === 0 ? (
            <li className="px-4 py-6 text-center text-caption text-ink-muted">{d.noStudents}</li>
          ) : (
            cohort.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-caption font-medium">{member.user.name}</p>
                    <p className="truncate text-fine text-ink-muted">{member.user.email}</p>
                  </div>
                  {paidStudentIds.has(member.userId) ? (
                    <span className="shrink-0 rounded-full bg-action/10 px-2 py-0.5 text-fine font-medium text-action">
                      {d.allAccess}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-fine font-medium text-ink-muted">
                      {d.noAccess}
                    </span>
                  )}
                </div>
                <RemoveMemberForm cohortId={cohort.id} userId={member.userId} label={d.remove} />
              </li>
            ))
          )}
        </ul>
        <div className="mt-4">
          <AddMemberForm cohortId={cohort.id} t={d.addMemberForm} />
        </div>
      </div>

      <div className="border-t border-hairline pt-6">
        <DeleteCohortForm cohortId={cohort.id} />
      </div>
    </div>
  );
}
