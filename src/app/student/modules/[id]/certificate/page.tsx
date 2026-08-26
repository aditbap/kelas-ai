import { redirect } from 'next/navigation';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { requireRole } from '@/lib/session';

import { loadModulePlayerData } from '../data';
import { PrintButton } from './print-button';

export default async function ModuleCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole(Role.Student);
  const { t } = await getTranslations();
  const s = t.student.progress;

  const result = await loadModulePlayerData(id);
  if (result.status !== 'ok' || result.data.overallPercent < 100) {
    redirect('/student/progress');
  }

  const { module: mod } = result.data;

  const lastProgress = await prisma.sessionProgress.findFirst({
    where: { userId: session.userId, session: { moduleId: id } },
    orderBy: { updatedAt: 'desc' },
  });
  const completedAt = (lastProgress?.updatedAt ?? new Date()).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl print:max-w-none">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton label={t.student.dashboard.printCertificate} />
      </div>

      <style>{'@page { size: landscape; margin: 0; }'}</style>

      <div
        className="relative aspect-[1.414/1] w-full overflow-hidden rounded-2xl bg-white bg-contain bg-center bg-no-repeat text-center shadow-lg print:h-screen print:w-screen print:rounded-none print:shadow-none"
        style={{
          backgroundImage: 'url(/certificate-bg.png)',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <p className="absolute top-[46%] w-full text-tagline font-semibold text-[#1a1a1a]">
          {session.name}
        </p>
        <p className="absolute top-[57%] w-full text-fine text-[#555]">
          {mod.title} &middot; {completedAt}
        </p>
      </div>
    </div>
  );
}
