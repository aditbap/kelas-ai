import { ArrowRight, CheckCircle, Lock, PlayCircle } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { hasAllAccess } from '@/lib/access';
import { Button } from '@/components/ui/button';
import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { getModuleCompletionPercent, isModuleUnlockedForUser } from '@/lib/module-completion';
import { requireRole } from '@/lib/session';
import { cn } from '@/lib/utils';

export default async function ModulesPage() {
  const session = await requireRole(Role.Student);
  const { t } = await getTranslations();
  const s = t.student.modules;

  if (!(await hasAllAccess(session.userId))) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-display-md">{s.title}</h1>
        <div className="mt-6 rounded-lg border border-hairline bg-parchment p-6 text-caption">
          <p className="font-medium text-ink">{s.getAllAccessTitle}</p>
          <p className="mt-1 text-ink-muted">{s.getAllAccessDescription}</p>
          <div className="mt-4">
            <Button render={<Link href="/student/checkout">{s.getAllAccessCta}</Link>} />
          </div>
        </div>
      </div>
    );
  }

  const modules = await prisma.module.findMany({
    where: { isPublished: true },
    include: { prerequisite: true, _count: { select: { sessions: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const modulesWithStatus = await Promise.all(
    modules.map(async (module) => ({
      module,
      percent: await getModuleCompletionPercent(session.userId, module.id),
      unlocked: await isModuleUnlockedForUser(session.userId, module),
    })),
  );

  // Surface the single in-flight module up top so returning students can
  // jump straight back in instead of hunting for it in the grid below.
  const continueEntry = modulesWithStatus.find(
    ({ unlocked, percent }) => unlocked && percent > 0 && percent < 100,
  );
  const gridEntries = continueEntry
    ? modulesWithStatus.filter((entry) => entry.module.id !== continueEntry.module.id)
    : modulesWithStatus;

  function statusLabel(percent: number, unlocked: boolean) {
    if (!unlocked) return s.locked;
    if (percent >= 100) return s.statusCompleted;
    if (percent > 0) return s.statusInProgress;
    return s.statusNotStarted;
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-display-md">{s.title}</h1>
      <p className="mt-2 text-ink-muted">{s.subtitle}</p>

      {modulesWithStatus.length === 0 ? (
        <div className="mt-8 rounded-xl border border-hairline bg-elevated p-8 text-center text-caption text-ink-muted">
          {s.nothingPublished}
        </div>
      ) : (
        <>
          {continueEntry ? (
            <Link
              href={`/student/modules/${continueEntry.module.id}`}
              className="mt-8 flex flex-col items-start gap-4 rounded-xl border border-hairline bg-elevated p-5 transition-shadow hover:shadow-product sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                <PlayCircle weight="fill" className="h-9 w-9 shrink-0 text-action" />
                <div className="min-w-0">
                  <p className="text-fine font-semibold tracking-wide text-action uppercase">
                    {s.continueLearning}
                  </p>
                  <h2 className="mt-0.5 truncate text-base font-semibold text-ink">
                    {continueEntry.module.title}
                  </h2>
                  <div className="mt-2 h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-muted/50">
                    <div
                      className="h-full rounded-full bg-action"
                      style={{ width: `${continueEntry.percent}%` }}
                    />
                  </div>
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 text-caption font-medium text-action">
                {s.continueCta} ({continueEntry.percent}%)
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gridEntries.map(({ module, percent, unlocked }) => {
              const card = (
                <div
                  className={cn(
                    'flex h-full flex-col rounded-xl border border-hairline bg-elevated p-5 transition-[box-shadow,border-color]',
                    unlocked && 'hover:border-ink/20 hover:shadow-product',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2
                      className={cn(
                        'text-base font-semibold',
                        unlocked ? 'text-ink' : 'text-ink-muted',
                      )}
                    >
                      {module.title}
                    </h2>
                    {percent === 100 ? (
                      <CheckCircle weight="fill" className="h-5 w-5 shrink-0 text-action" />
                    ) : !unlocked ? (
                      <Lock className="h-5 w-5 shrink-0 text-ink-muted" />
                    ) : null}
                  </div>

                  <p className="mt-1 text-fine text-ink-muted">
                    {s.sessionsCount(module._count.sessions)}
                  </p>

                  {module.description ? (
                    <p className="mt-2 flex-1 text-sm text-ink-muted line-clamp-3">
                      {module.description}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {!unlocked && module.prerequisite ? (
                    <p className="mt-3 text-fine text-ink-muted">
                      {s.lockedPrereq.replace('{title}', module.prerequisite.title)}
                    </p>
                  ) : null}

                  <div className="mt-5">
                    {unlocked ? (
                      <>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                          <div
                            className="h-full rounded-full bg-action"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-fine font-medium text-ink-muted">
                          <span>{statusLabel(percent, unlocked)}</span>
                          <span>{percent}%</span>
                        </div>
                      </>
                    ) : (
                      <span className="inline-flex rounded-full border border-hairline px-2 py-0.5 text-fine font-medium text-ink-muted">
                        {s.locked}
                      </span>
                    )}
                  </div>
                </div>
              );

              return unlocked ? (
                <Link key={module.id} href={`/student/modules/${module.id}`}>
                  {card}
                </Link>
              ) : (
                <div key={module.id}>{card}</div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
