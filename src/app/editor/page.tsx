import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { requireRole } from '@/lib/session';

export default async function EditorDashboardPage() {
  const session = await requireRole(Role.Editor);
  const { t } = await getTranslations();
  const s = t.editor.dashboard;

  // Neither query depends on the other, so run them together instead of
  // paying for two sequential round trips.
  const [cohorts, pendingSubmissions, modules] = await Promise.all([
    prisma.cohort.findMany({
      where: { editorId: session.userId },
      include: { _count: { select: { members: true } } },
      orderBy: { onsiteDate: 'desc' },
    }),
    prisma.submission.findMany({
      where: {
        status: 'Pending',
        assignment: { session: { module: { createdByEditorId: session.userId } } },
      },
      include: { user: true, assignment: { include: { session: { include: { module: true } } } } },
      orderBy: { submittedAt: 'asc' },
      take: 10,
    }),
    prisma.module.findMany({
      where: { createdByEditorId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-display-md">{s.title}</h1>
        <p className="mt-1 text-ink-muted">
          {s.summary(cohorts.length, pendingSubmissions.length)}
        </p>
      </div>

      <div>
        <h2 className="text-caption font-semibold text-ink-muted">{s.yourCohorts}</h2>
        {cohorts.length === 0 ? (
          <p className="mt-2 text-caption text-ink-muted">{s.noCohortsYet}</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {cohorts.map((cohort) => (
              <li
                key={cohort.id}
                className="rounded-full border border-hairline px-3 py-1 text-caption"
              >
                {cohort.name} ({cohort._count.members})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-caption font-semibold text-ink-muted">{s.gradingQueue}</h2>
        {pendingSubmissions.length === 0 ? (
          <p className="mt-2 text-caption text-ink-muted">{s.nothingPending}</p>
        ) : (
          <ul className="mt-3 divide-y divide-hairline rounded-lg border border-hairline">
            {pendingSubmissions.map((submission) => (
              <li key={submission.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-caption font-medium">{submission.user.name}</p>
                  <p className="truncate text-fine text-ink-muted">
                    {submission.assignment.session.module.title}
                  </p>
                </div>
                <span className="shrink-0 text-fine text-ink-muted">
                  {submission.submittedAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-caption font-semibold text-ink-muted">{s.yourModules}</h2>
        {modules.length === 0 ? (
          <p className="mt-2 text-caption text-ink-muted">{s.noModulesYet}</p>
        ) : (
          <ul className="mt-3 divide-y divide-hairline rounded-lg border border-hairline">
            {modules.map((module) => (
              <li key={module.id} className="px-4 py-3">
                <p className="text-caption font-medium">{module.title}</p>
                {module.description ? (
                  <p className="mt-0.5 text-fine text-ink-muted">{module.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
