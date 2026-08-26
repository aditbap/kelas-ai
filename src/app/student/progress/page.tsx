import {
  BookOpen,
  GraduationCap,
  Circle,
  CheckCircle,
  CaretDown as ChevronDown,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { hasAllAccess } from '@/lib/access';
import { Button } from '@/components/ui/button';
import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { computeSessionCompletionPercent } from '@/lib/progress';
import { requireRole } from '@/lib/session';

type SessionData = {
  id: string;
  title: string;
  isCompleted: boolean;
};

type ModuleData = {
  id: string;
  title: string;
  sessions: SessionData[];
  isCompleted: boolean;
};

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireRole(Role.Student);
  const params = await searchParams;
  const activeTab = params.tab === 'completed' ? 'completed' : 'active';
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
    include: {
      sessions: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { lessons: true, assignments: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const progressRows = await prisma.sessionProgress.findMany({
    where: { userId: session.userId },
  });
  const progressMap = new Map(progressRows.map((r) => [r.sessionId, r]));

  const processedModules: ModuleData[] = [];

  for (const mod of modules) {
    const sessions: SessionData[] = [];
    let allSessionsCompleted = true;

    for (const sess of mod.sessions) {
      const prog = progressMap.get(sess.id);
      const percent = prog
        ? computeSessionCompletionPercent(
            {
              lessonsCompletedCount: prog.lessonsCompletedCount,
              assignmentStatus: prog.assignmentStatus,
            },
            { totalLessons: sess._count.lessons, hasAssignment: sess._count.assignments > 0 },
          )
        : 0;

      const isCompleted = percent === 100;
      if (!isCompleted) allSessionsCompleted = false;

      sessions.push({ id: sess.id, title: sess.title, isCompleted });
    }

    if (sessions.length === 0) continue;

    const moduleIsCompleted = allSessionsCompleted;

    if (activeTab === 'active' && moduleIsCompleted) continue;
    if (activeTab === 'completed' && !moduleIsCompleted) continue;

    processedModules.push({
      id: mod.id,
      title: mod.title,
      sessions,
      isCompleted: moduleIsCompleted,
    });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-ink" />
        <h1 className="text-display-sm font-semibold text-ink">{s.title}</h1>
      </div>

      <div className="flex rounded-lg bg-elevated border border-hairline p-1">
        <Link
          href="?tab=active"
          className={`flex-1 text-center py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'active'
              ? 'bg-background shadow-sm border border-hairline text-ink'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          {s.activeTab}
        </Link>
        <Link
          href="?tab=completed"
          className={`flex-1 text-center py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'completed'
              ? 'bg-background shadow-sm border border-hairline text-ink'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          {s.completedTab}
        </Link>
      </div>

      <div className="space-y-4">
        {processedModules.length === 0 ? (
          <div className="py-10 text-center text-caption text-ink-muted border border-hairline rounded-lg">
            {s.empty}
          </div>
        ) : (
          processedModules.map((module) => (
            <details
              key={module.id}
              className="group rounded-xl border border-hairline bg-elevated overflow-hidden"
              open
            >
              <summary className="flex items-center gap-3 p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-muted/20 transition-colors">
                <ChevronDown className="h-4 w-4 text-ink-muted transition-transform group-open:-rotate-180 shrink-0" />
                <GraduationCap className="h-5 w-5 text-ink shrink-0" />
                <h2 className="text-base font-semibold text-ink">{module.title}</h2>
              </summary>
              <div className="border-t border-hairline px-5">
                <ul className="divide-y divide-hairline">
                  {module.sessions.map((sess) => (
                    <li key={sess.id} className="flex items-start gap-3 py-4">
                      {sess.isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-4 w-4 text-ink-muted shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm font-medium text-ink">{sess.title}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
