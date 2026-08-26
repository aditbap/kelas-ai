import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getTranslations } from '@/lib/i18n/get-locale';

import { loadModulePlayerData } from './data';

export default async function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
  const target = data.items.find((item) => !item.completed) ?? data.items[0];

  if (!target) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-display-md">{data.module.title}</h1>
        <p className="mt-6 text-caption text-ink-muted">{d.noSessionsYet}</p>
      </div>
    );
  }

  redirect(`/student/modules/${id}/${target.itemId}`);
}
