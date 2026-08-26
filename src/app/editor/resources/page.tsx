import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { requireRole } from '@/lib/session';

import { CreateResourceForm } from './create-resource-form';

export default async function EditorResourcesPage() {
  await requireRole(Role.Editor);
  const { t } = await getTranslations();
  const s = t.editor.resources;

  const resources = await prisma.resourceItem.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="max-w-4xl">
      <h1 className="text-display-md">{s.title}</h1>
      <p className="mt-2 text-ink-muted">{s.subtitle}</p>

      <div className="mt-8 max-w-sm">
        <CreateResourceForm t={s.createForm} />
      </div>

      <ul className="mt-10 divide-y divide-hairline rounded-lg border border-hairline">
        {resources.length === 0 ? (
          <li className="px-4 py-6 text-center text-caption text-ink-muted">
            {s.nothingPublished}
          </li>
        ) : (
          resources.map((resource) => (
            <li key={resource.id} className="px-4 py-3">
              <p className="text-caption font-medium">
                {resource.title}{' '}
                <span className="ml-1 rounded-full border border-hairline px-2 py-0.5 text-fine text-ink-muted">
                  {resource.type}
                </span>
              </p>
              <p className="mt-0.5 text-fine text-ink-muted">{resource.content}</p>
              {resource.tags.length > 0 ? (
                <p className="mt-1 text-fine text-ink-muted">{resource.tags.join(', ')}</p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
