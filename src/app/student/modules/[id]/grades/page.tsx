import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getTranslations } from '@/lib/i18n/get-locale';

import { loadModulePlayerData } from '../data';

export default async function ModuleGradesPage({ params }: { params: Promise<{ id: string }> }) {
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
  const assignments = data.items.filter((item) => item.type === 'assignment');

  return (
    <div className="max-w-3xl">
      <h1 className="text-display-md">{d.gradesTitle}</h1>
      <p className="mt-1 text-ink-muted">{data.module.title}</p>

      {assignments.length === 0 ? (
        <p className="mt-6 text-caption text-ink-muted">{d.gradesEmpty}</p>
      ) : (
        <div className="mt-6 divide-y divide-hairline rounded-lg border border-hairline">
          {assignments.map((item) => (
            <Link
              key={item.itemId}
              href={`/student/modules/${id}/${item.itemId}`}
              className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-parchment"
            >
              <span className="min-w-0 truncate text-caption font-medium text-ink">
                {item.instructions}
              </span>
              {item.submission?.grade ? (
                <span className="shrink-0 text-caption font-medium text-action">
                  {item.submission.grade.score != null
                    ? item.submission.grade.score
                    : item.submission.grade.passFail
                      ? d.pass
                      : d.fail}
                </span>
              ) : (
                <span className="shrink-0 text-caption text-ink-muted">{d.notGradedYet}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
