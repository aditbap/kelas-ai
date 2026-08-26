import { hasAllAccess } from '@/lib/access';
import { prisma } from '@/lib/db';
import { escapeHtml, sendEmail } from '@/lib/email';
import { getModuleCompletionPercent } from '@/lib/module-completion';

const NUDGE_INTERVAL_DAYS = 7;

/**
 * Post-training habit loop (PRD §5.6, BUILD_PLAN Phase 12): once a cohort's
 * onsite date has passed, its All-Access members with an unfinished module
 * get a weekly nudge pointing at what's left, plus the newest resource in the
 * library. Meant to run on a schedule - see src/app/api/cron/nudges/route.ts.
 */
export async function sendPostTrainingNudges(): Promise<{ nudged: number; skipped: number }> {
  const now = new Date();
  const nudgeCutoff = new Date(now.getTime() - NUDGE_INTERVAL_DAYS * 24 * 60 * 60 * 1000);

  const publishedModules = await prisma.module.findMany({ where: { isPublished: true } });

  let nudged = 0;
  let skipped = 0;

  if (publishedModules.length === 0) {
    return { nudged, skipped };
  }

  const pastCohorts = await prisma.cohort.findMany({
    where: { onsiteDate: { lt: now } },
    include: { members: { include: { user: true } } },
  });

  for (const cohort of pastCohorts) {
    for (const member of cohort.members) {
      const { user } = member;

      if (user.lastNudgedAt && user.lastNudgedAt > nudgeCutoff) {
        skipped += 1;
        continue;
      }

      if (!(await hasAllAccess(user.id))) {
        skipped += 1;
        continue;
      }

      let unfinished: (typeof publishedModules)[number] | undefined;
      for (const module_ of publishedModules) {
        const percent = await getModuleCompletionPercent(user.id, module_.id);
        if (percent < 100) {
          unfinished = module_;
          break;
        }
      }

      if (!unfinished) {
        skipped += 1;
        continue;
      }

      const resource = await prisma.resourceItem.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      try {
        await sendEmail({
          to: user.email,
          subject: 'Keep practicing: pick up where you left off',
          html: [
            `<p>Hi ${escapeHtml(user.name.split(' ')[0])},</p>`,
            `<p>You haven't finished <strong>${escapeHtml(unfinished.title)}</strong> yet. It only takes a few minutes to pick back up.</p>`,
            resource
              ? `<p>Also new since your last visit: <strong>${escapeHtml(resource.title)}</strong>.</p>`
              : '',
          ].join(''),
        });
      } catch (error) {
        console.error(`Failed to send post-training nudge to ${user.email}:`, error);
        skipped += 1;
        continue;
      }

      await prisma.user.update({ where: { id: user.id }, data: { lastNudgedAt: now } });
      nudged += 1;
    }
  }

  return { nudged, skipped };
}
