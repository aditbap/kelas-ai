import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getTranslations } from '@/lib/i18n/get-locale';

import { loadModulePlayerData } from '../data';

export default async function ModuleInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getTranslations();
  const s = t.student.modules;
  const d = t.student.moduleDetail;

  const result = await loadModulePlayerData(id);

  if (result.status === 'not-found') notFound();

  if (result.status === 'no-access') {
    return (
      <div className="max-w-2xl">
        <h1 className="text-display-md">{s.title}</h1>
        <div className="mt-6 rounded-lg border border-hairline bg-parchment p-6 text-caption">
          <p className="font-medium text-ink">{d.getAllAccessToUnlockThis}</p>
          <div className="mt-4">
            <Button render={<Link href="/student/checkout">{s.getAllAccessCta}</Link>} />
          </div>
        </div>
      </div>
    );
  }

  if (result.status === 'locked') {
    return (
      <div className="max-w-3xl">
        <h1 className="text-display-md">{result.moduleTitle}</h1>
        <div className="mt-6 rounded-lg border border-hairline bg-parchment p-5 text-caption">
          <p className="font-medium text-ink">{d.lockedTitle}</p>
          <p className="mt-1 text-ink-muted">
            {d.lockedDescription.replace('{title}', result.prerequisiteTitle ?? '')}
          </p>
        </div>
      </div>
    );
  }

  const { data } = result;
  const lessonCount = data.items.filter((item) => item.type === 'lesson').length;
  const assignmentCount = data.items.filter((item) => item.type === 'assignment').length;

  return (
    <div className="max-w-3xl">
      <h1 className="text-display-md">{data.module.title}</h1>
      <p className="mt-1 text-fine font-semibold tracking-wide text-ink-muted uppercase">
        {d.courseInfoTitle}
      </p>

      <p className="mt-4 text-caption whitespace-pre-wrap text-ink">
        {data.module.description || d.noDescription}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-hairline p-4 text-center">
          <p className="text-tagline font-semibold text-ink">{data.sessions.length}</p>
          <p className="mt-1 text-fine text-ink-muted">{d.statSessions}</p>
        </div>
        <div className="rounded-lg border border-hairline p-4 text-center">
          <p className="text-tagline font-semibold text-ink">{lessonCount}</p>
          <p className="mt-1 text-fine text-ink-muted">{d.statLessons}</p>
        </div>
        <div className="rounded-lg border border-hairline p-4 text-center">
          <p className="text-tagline font-semibold text-ink">{assignmentCount}</p>
          <p className="mt-1 text-fine text-ink-muted">{d.statAssignments}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-hairline p-4 text-caption">
        <span className="text-ink-muted">{d.prerequisiteLabel}</span>
        <span className="font-medium text-ink">
          {data.module.prerequisiteTitle ?? d.noPrerequisite}
        </span>
      </div>
    </div>
  );
}
