import { ChartLine, FileText, GraduationCap, LockOpen } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getTranslations } from '@/lib/i18n/get-locale';

import { loadModulePlayerData } from '../data';

const DESCRIPTION_PREVIEW_LENGTH = 220;

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
  const description = data.module.description || d.noDescription;
  const isLongDescription = description.length > DESCRIPTION_PREVIEW_LENGTH;

  const rows = [
    {
      icon: FileText,
      label: d.basicInfoLabel,
      value: d.basicInfoValue
        .replace('{sessions}', String(data.sessions.length))
        .replace('{lessons}', String(lessonCount))
        .replace('{assignments}', String(assignmentCount)),
    },
    {
      icon: LockOpen,
      label: d.prerequisiteLabel,
      value: data.module.prerequisiteTitle ?? d.noPrerequisite,
    },
    { icon: GraduationCap, label: d.howToPassLabel, value: d.howToPassValue },
    {
      icon: ChartLine,
      label: d.yourProgressLabel,
      value: `${data.overallPercent}%`,
    },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-display-md">{data.module.title}</h1>
      <p className="mt-1 text-caption text-ink-muted">
        {d.byLabel} {data.module.createdByName}
      </p>

      <h2 className="mt-8 text-tagline font-semibold text-ink">{d.courseInfoTitle}</h2>
      {isLongDescription ? (
        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-caption text-ink [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">
              {description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}…{' '}
              <span className="font-medium text-action">{d.showMore}</span>
            </span>
            <span className="hidden whitespace-pre-wrap group-open:inline">
              {description} <span className="font-medium text-action">{d.showLess}</span>
            </span>
          </summary>
        </details>
      ) : (
        <p className="mt-3 text-caption whitespace-pre-wrap text-ink">{description}</p>
      )}

      <div className="mt-8 divide-y divide-hairline rounded-xl border border-hairline">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-4 p-5">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
            <div className="min-w-0">
              <p className="text-caption font-semibold text-ink">{label}</p>
              <p className="mt-0.5 text-caption text-ink-muted">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
