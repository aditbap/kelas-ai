import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { requireRole } from '@/lib/session';

import { GradeForm } from './grade-form';

export default async function GradingQueuePage() {
  const session = await requireRole(Role.Editor);
  const { t } = await getTranslations();
  const s = t.editor.grading;

  const submissions = await prisma.submission.findMany({
    where: {
      status: 'Pending',
      assignment: { session: { module: { createdByEditorId: session.userId } } },
    },
    include: { user: true, assignment: { include: { session: { include: { module: true } } } } },
    orderBy: { submittedAt: 'asc' },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-display-md">{s.title}</h1>
      <p className="mt-2 text-ink-muted">{s.subtitleCount(submissions.length)}</p>

      <ul className="mt-8 space-y-4">
        {submissions.length === 0 ? (
          <li className="rounded-lg border border-hairline px-4 py-6 text-center text-caption text-ink-muted">
            {s.nothingPending}
          </li>
        ) : (
          submissions.map((submission) => (
            <li key={submission.id} className="rounded-lg border border-hairline p-4">
              <p className="text-caption font-medium">
                {submission.user.name} · {submission.assignment.session.module.title}
              </p>
              <p className="mt-0.5 text-fine text-ink-muted">
                {submission.assignment.instructions}
                {submission.assignment.isAdvancedMaterial ? s.advancedMaterialSuffix : ''}
              </p>
              <p className="mt-2 rounded-md bg-parchment p-2 text-caption">{submission.content}</p>
              <GradeForm submissionId={submission.id} t={s.form} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
