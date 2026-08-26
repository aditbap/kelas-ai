import { Certificate, Lock, Trophy } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { hasAllAccess } from '@/lib/access';
import { Button } from '@/components/ui/button';
import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { getModuleCompletionPercent, hasFailedGradeInModule } from '@/lib/module-completion';
import { requireRole } from '@/lib/session';
import { cn } from '@/lib/utils';

export default async function ProgressPage() {
  const session = await requireRole(Role.Student);
  const { t } = await getTranslations();
  const s = t.student.progress;

  if (!(await hasAllAccess(session.userId))) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-display-md">{s.title}</h1>
        <div className="mt-6 rounded-lg border border-hairline bg-parchment p-6 text-caption">
          <p className="font-medium text-ink">{s.getAllAccessTitle}</p>
          <div className="mt-4">
            <Button render={<Link href="/student/checkout">{s.getAllAccessCta}</Link>} />
          </div>
        </div>
      </div>
    );
  }

  const modules = await prisma.module.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });

  const modulesWithPercent = await Promise.all(
    modules.map(async (module) => ({
      module,
      percent: await getModuleCompletionPercent(session.userId, module.id),
      failed: await hasFailedGradeInModule(session.userId, module.id),
    })),
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-ink" />
        <h1 className="text-display-sm font-semibold text-ink">{s.title}</h1>
      </div>
      <p className="mt-1 text-ink-muted">{s.subtitle}</p>

      {modulesWithPercent.length === 0 ? (
        <div className="mt-8 rounded-xl border border-hairline bg-elevated p-8 text-center text-caption text-ink-muted">
          {s.empty}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modulesWithPercent.map(({ module, percent, failed }) => {
            const earned = percent === 100 && !failed;

            return (
              <div
                key={module.id}
                className={cn(
                  'flex flex-col rounded-xl border p-5',
                  earned
                    ? 'border-action/30 bg-action/5'
                    : 'border-hairline bg-elevated text-ink-muted',
                )}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    earned ? 'bg-action/15 text-action' : 'bg-muted/40 text-ink-faint',
                  )}
                >
                  {earned ? (
                    <Certificate weight="fill" className="h-6 w-6" />
                  ) : (
                    <Lock className="h-6 w-6" />
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <h2
                    className={cn(
                      'text-base font-semibold',
                      earned ? 'text-ink' : 'text-ink-muted',
                    )}
                  >
                    {module.title}
                  </h2>
                  {earned ? (
                    <span className="shrink-0 rounded-full bg-action/15 px-2 py-0.5 text-fine font-medium text-action">
                      {s.earnedBadge}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-fine text-ink-muted">
                  {earned
                    ? s.certificateOf
                    : s.lockedProgress.replace('{percent}', String(percent))}
                </p>

                <div className="mt-4 flex-1" />

                {earned ? (
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/student/modules/${module.id}/certificate`} />}
                  >
                    {t.student.dashboard.printCertificate}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
