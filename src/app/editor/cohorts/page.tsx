import Link from 'next/link';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { requireRole } from '@/lib/session';

import { CreateCohortForm } from './create-cohort-form';

export default async function CohortsPage() {
  const session = await requireRole(Role.Editor);
  const { t } = await getTranslations();
  const s = t.editor.cohorts;

  const cohorts = await prisma.cohort.findMany({
    where: { editorId: session.userId },
    include: { _count: { select: { members: true } } },
    orderBy: { onsiteDate: 'desc' },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-display-md">{s.title}</h1>
      <p className="mt-2 text-ink-muted">{s.subtitle}</p>

      <div className="mt-8 max-w-sm">
        <CreateCohortForm t={s.createForm} />
      </div>

      <ul className="mt-10 divide-y divide-hairline rounded-lg border border-hairline">
        {cohorts.length === 0 ? (
          <li className="px-4 py-6 text-center text-caption text-ink-muted">{s.noCohorts}</li>
        ) : (
          cohorts.map((cohort) => (
            <li key={cohort.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/editor/cohorts/${cohort.id}`}
                  className="block truncate text-caption font-medium text-ink hover:underline"
                >
                  {cohort.name}
                </Link>
                <p className="mt-0.5 truncate text-fine text-ink-muted">
                  {s.onsitePrefix} {cohort.onsiteDate.toLocaleDateString()} ·{' '}
                  {s.studentsCountSuffix(cohort._count.members)}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
