import { notFound } from 'next/navigation';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { requireRole } from '@/lib/session';

import { OutlineTab } from './outline-tab';
import { PreviewTab } from './preview-tab';
import { SessionEditor } from './session-editor';
import { SettingsTab } from './settings-tab';
import { StudioShell, type StudioTab } from './studio-shell';

function parseTab(value: string | undefined): StudioTab {
  return value === 'preview' || value === 'settings' ? value : 'outline';
}

export default async function ModuleStudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; session?: string; device?: string }>;
}) {
  const session = await requireRole(Role.Editor);
  const { id } = await params;
  const { tab: rawTab, session: sessionId, device: rawDevice } = await searchParams;
  const { t, locale } = await getTranslations();
  const s = t.editor.studio;

  const module_ = await prisma.module.findFirst({
    where: { id, createdByEditorId: session.userId },
    include: {
      prerequisite: true,
      sessions: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' } },
          assignments: { orderBy: { createdAt: 'asc' } },
        },
      },
    },
  });
  if (!module_) notFound();

  // An unrecognised ?session= id falls back to the outline rather than 404ing:
  // it usually means the session was just deleted or the link is stale.
  const openSession = sessionId
    ? (module_.sessions.find((moduleSession) => moduleSession.id === sessionId) ?? null)
    : null;
  const activeTab = openSession ? 'outline' : parseTab(rawTab);

  const updatedAt = module_.updatedAt.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', {
    dateStyle: 'long',
  });

  return (
    <StudioShell
      moduleId={module_.id}
      title={module_.title}
      isPublished={module_.isPublished}
      updatedAt={updatedAt}
      activeTab={activeTab}
      t={s}
      publishFormT={t.editor.moduleDetail.publishForm}
    >
      {openSession ? (
        <SessionEditor
          moduleId={module_.id}
          session={openSession}
          allSessions={module_.sessions.map((moduleSession) => ({
            id: moduleSession.id,
            order: moduleSession.order,
            title: moduleSession.title,
          }))}
          t={s}
          moduleDetailT={t.editor.moduleDetail}
          lessonKindLabel={t.student.moduleDetail.lessonKindLabel}
        />
      ) : activeTab === 'preview' ? (
        <PreviewTab
          moduleId={module_.id}
          moduleTitle={module_.title}
          description={module_.description}
          prerequisiteTitle={module_.prerequisite?.title ?? null}
          sessions={module_.sessions}
          device={rawDevice === 'phone' ? 'phone' : 'desktop'}
          t={s}
        />
      ) : activeTab === 'settings' ? (
        <SettingsTab
          moduleId={module_.id}
          isPublished={module_.isPublished}
          prerequisiteModuleId={module_.prerequisiteModuleId}
          otherModules={await prisma.module.findMany({
            where: { createdByEditorId: session.userId, id: { not: module_.id } },
            select: { id: true, title: true },
            orderBy: { createdAt: 'desc' },
          })}
          t={s}
          publishFormT={t.editor.moduleDetail.publishForm}
        />
      ) : (
        <OutlineTab
          moduleId={module_.id}
          title={module_.title}
          description={module_.description}
          isPublished={module_.isPublished}
          sessions={module_.sessions}
          t={s}
          lessonKindLabel={t.student.moduleDetail.lessonKindLabel}
          addSessionFormT={t.editor.moduleDetail.addSessionForm}
        />
      )}
    </StudioShell>
  );
}
