import {
  ArrowUpRight,
  CalendarBlank,
  MapPin,
  CalendarCheck,
  LockKeyOpen,
  CheckCircle,
  FileText,
  ChatCircleText,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { hasAllAccess } from '@/lib/access';
import { Button } from '@/components/ui/button';
import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { getModuleCompletionPercent } from '@/lib/module-completion';
import { requireRole } from '@/lib/session';

import { SubscriptionPopup } from '@/components/subscription-popup';

import { DailyCheckInButton } from './daily-checkin-button';

export default async function StudentDashboardPage() {
  const session = await requireRole(Role.Student);
  const { t, locale } = await getTranslations();
  const s = t.student.dashboard;

  const [memberships, hasAccess] = await Promise.all([
    prisma.cohortMember.findMany({
      where: { userId: session.userId },
      include: { cohort: { include: { editor: true } } },
      orderBy: { cohort: { onsiteDate: 'desc' } },
    }),
    hasAllAccess(session.userId),
  ]);

  const modules = hasAccess
    ? await prisma.module.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const percentByModule = new Map(
    await Promise.all(
      modules.map(
        async (module) =>
          [module.id, await getModuleCompletionPercent(session.userId, module.id)] as const,
      ),
    ),
  );

  // Calculate some aggregate progress for the first card
  const completedCount = [...percentByModule.values()].filter((percent) => percent === 100).length;

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-display-sm font-semibold text-ink">
          {s.greeting.replace('{name}', session.name.split(' ')[0])}
        </h1>
        <p className="mt-1 text-ink-muted">{s.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Learning progress */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink">{s.learningProgress}</h2>
              <Link
                href="/student/progress"
                className="text-sm font-medium text-action hover:underline flex items-center gap-1"
              >
                {s.seeAll}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.slice(0, 2).map((module) => {
                const percent = percentByModule.get(module.id) ?? 0;
                return (
                  <div
                    key={module.id}
                    className="rounded-xl border border-hairline bg-elevated p-5 flex flex-col h-full"
                  >
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-ink">{module.title}</h3>
                      <p className="mt-2 text-sm text-ink-muted line-clamp-3">
                        {module.description ?? s.defaultModuleDescription}
                      </p>
                    </div>

                    <div className="mt-6">
                      <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-action rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-right text-xs font-medium text-ink-muted">
                        {percent}%
                      </p>

                      <div className="mt-4 flex justify-end">
                        {percent === 100 ? (
                          <Button size="sm" variant="outline">
                            {s.printCertificate}
                          </Button>
                        ) : (
                          <Button size="sm" render={<Link href="/student/modules" />}>
                            {s.continueLearning}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {modules.length === 0 && (
                <div className="col-span-1 md:col-span-2 rounded-xl border border-hairline bg-elevated p-8 text-center text-ink-muted">
                  {hasAccess ? s.noModulesLearned : s.getAllAccessToUnlock}
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Zoom */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink">{s.upcomingZoom}</h2>
            </div>

            {memberships.length > 0 ? (
              <div className="rounded-xl overflow-hidden border border-hairline bg-elevated">
                <div className="h-40 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                  {/* Decorative placeholder for event banner */}
                  <div className="text-center">
                    <span className="bg-white/80 dark:bg-black/50 px-3 py-1 text-xs font-medium rounded-full text-action inline-block mb-2">
                      {s.seminarBadge}
                    </span>
                    <h3 className="text-xl font-bold text-ink max-w-sm px-4">
                      {s.onsiteSessionTitle.replace('{name}', memberships[0].cohort.name)}
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-ink">
                    {s.closingSessionTitle.replace('{name}', memberships[0].cohort.name)}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <CalendarBlank className="h-4 w-4" />
                      {memberships[0].cohort.onsiteDate.toLocaleDateString(
                        locale === 'id' ? 'id-ID' : 'en-GB',
                        { day: 'numeric', month: 'long', year: 'numeric' },
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {s.online}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-hairline bg-elevated p-6 text-center text-ink-muted">
                {s.noUpcomingEvents}
              </div>
            )}
          </section>

          {/* Other activity */}
          <section>
            <h2 className="text-lg font-semibold text-ink mb-4">{s.otherActivity}</h2>
            <div className="rounded-xl border border-hairline bg-elevated p-5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium mb-3">
                {s.milestoneBadge}
              </span>
              <h3 className="text-sm font-semibold text-ink">{s.startJourney}</h3>
              <p className="mt-1 text-xs text-ink-muted">{s.startJourneyDescription}</p>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs text-ink-muted whitespace-nowrap">{s.yourProgress}</span>
                  <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ink rounded-full"
                      style={{ width: `${completedCount > 0 ? 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-ink whitespace-nowrap">
                    {completedCount > 0 ? '100%' : '0%'}
                  </span>
                </div>

                <Button size="xs" variant="default" render={<Link href="/student/modules" />}>
                  {s.continueLearning} <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Daily Check-in */}
          <div className="rounded-xl border border-hairline bg-elevated p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-base font-semibold text-ink">{t.student.dailyCheckin.title}</h3>
                <Link href="#" className="text-xs text-action hover:underline">
                  {s.viewHistory}
                </Link>
              </div>
              <CalendarCheck className="h-6 w-6 text-pink-500" />
            </div>
            <p className="mt-4 text-xs text-ink-muted leading-relaxed">{s.checkInDescription}</p>
            <DailyCheckInButton
              t={t.student.dailyCheckin}
              activeClasses={modules.map((module) => ({ id: module.id, title: module.title }))}
            />
          </div>

          {/* All-Access Package */}
          {hasAccess ? (
            <div className="rounded-xl border border-hairline bg-elevated p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-semibold text-ink max-w-[180px]">
                  {s.allAccessPackage}
                </h3>
                <CheckCircle className="h-6 w-6 text-action" />
              </div>
              <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                {s.fullAccessDescription}
              </p>
              <div className="mt-5">
                <Button
                  className="w-full"
                  variant="outline"
                  render={<Link href="/student/checkout" />}
                >
                  {s.manageSubscription}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-hairline bg-elevated p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-semibold text-ink max-w-[180px]">
                  {s.allAccessPackage}
                </h3>
                <LockKeyOpen className="h-6 w-6 text-pink-500" />
              </div>

              <p className="mt-2 mb-4 text-xs text-ink-muted leading-relaxed">
                {s.getFullAccessDescription}
              </p>

              <ul className="space-y-3 mt-4 text-xs text-ink-muted">
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" /> {s.lifetimeAccess}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" /> {s.globalCertificate}
                </li>
                <li className="flex items-center gap-2">
                  <ChatCircleText className="h-4 w-4 shrink-0" /> {s.discussionForum}
                </li>
              </ul>

              <div className="mt-5">
                <Button
                  className="w-full"
                  variant="default"
                  render={<Link href="/student/checkout" />}
                >
                  {s.getAllAccessCta} <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <SubscriptionPopup hasAccess={hasAccess} />
    </div>
  );
}
