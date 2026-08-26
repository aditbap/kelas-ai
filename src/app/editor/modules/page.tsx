import Link from 'next/link';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { requireRole } from '@/lib/session';

import { CreateModuleForm } from './create-module-form';

export default async function ModulesPage() {
  const session = await requireRole(Role.Editor);
  const { t } = await getTranslations();
  const s = t.editor.modules;

  const modules = await prisma.module.findMany({
    where: { createdByEditorId: session.userId },
    include: {
      sessions: { include: { lessons: true, assignments: true } },
      prerequisite: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-display-md">{s.title}</h1>
      <p className="mt-2 text-ink-muted">{s.subtitle}</p>

      <div className="mt-8 max-w-sm">
        <CreateModuleForm
          t={s.createForm}
          existingModules={modules.map((module) => ({ id: module.id, title: module.title }))}
        />
      </div>

      <ul className="mt-10 divide-y divide-hairline rounded-lg border border-hairline">
        {modules.length === 0 ? (
          <li className="px-4 py-6 text-center text-caption text-ink-muted">{s.noModules}</li>
        ) : (
          modules.map((module) => {
            const lessonCount = module.sessions.reduce((sum, se) => sum + se.lessons.length, 0);
            const assignmentCount = module.sessions.reduce(
              (sum, se) => sum + se.assignments.length,
              0,
            );
            return (
              <li key={module.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/editor/modules/${module.id}`}
                    className="block truncate text-caption font-medium text-ink hover:underline"
                  >
                    {module.title}
                  </Link>
                  <p className="mt-0.5 truncate text-fine text-ink-muted">
                    {s.countsSummary(module.sessions.length, lessonCount, assignmentCount)}
                    {module.prerequisite ? s.requiresSuffix(module.prerequisite.title) : ''}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-fine font-medium ${
                    module.isPublished
                      ? 'bg-action/10 text-action'
                      : 'border border-hairline text-ink-muted'
                  }`}
                >
                  {module.isPublished ? s.published : s.draft}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
