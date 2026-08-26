'use server';

import { revalidatePath } from 'next/cache';

import { ContentType, LessonKind, Role, SubmissionType } from '@/generated/prisma/client/enums';
import { logAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { wouldCreatePrerequisiteCycle } from '@/lib/prerequisite-chain';
import { requireRole } from '@/lib/session';

import type { ActionState } from '@/lib/actions';
export type { ActionState };

async function assertOwnsModule(editorId: string, moduleId: string) {
  return prisma.module.findFirst({ where: { id: moduleId, createdByEditorId: editorId } });
}

async function assertOwnsSession(editorId: string, sessionId: string) {
  return prisma.moduleSession.findFirst({
    where: { id: sessionId, module: { createdByEditorId: editorId } },
  });
}

export async function createModuleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const prerequisiteModuleId = String(formData.get('prerequisiteModuleId') ?? '').trim();

  if (!title) return { error: 'Give the module a title.' };

  if (prerequisiteModuleId && !(await assertOwnsModule(session.userId, prerequisiteModuleId))) {
    return { error: 'That prerequisite module is not one of yours.' };
  }

  const module_ = await prisma.module.create({
    data: {
      title,
      description: description || null,
      createdByEditorId: session.userId,
      prerequisiteModuleId: prerequisiteModuleId || null,
    },
  });
  await logAudit({
    actorId: session.userId,
    action: 'module.create',
    targetType: 'Module',
    targetId: module_.id,
  });

  revalidatePath('/editor/modules');
  return { success: `Created "${module_.title}".` };
}

export async function addSessionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const moduleId = String(formData.get('moduleId') ?? '');
  const title = String(formData.get('title') ?? '').trim();

  if (!(await assertOwnsModule(session.userId, moduleId))) {
    return { error: 'Module not found.' };
  }
  if (!title) return { error: 'Give the session a title.' };

  const count = await prisma.moduleSession.count({ where: { moduleId } });
  const moduleSession = await prisma.moduleSession.create({
    data: { moduleId, title, order: count + 1 },
  });
  await logAudit({
    actorId: session.userId,
    action: 'session.create',
    targetType: 'ModuleSession',
    targetId: moduleSession.id,
  });

  revalidatePath(`/editor/modules/${moduleId}`);
  return { success: `Added session "${title}".` };
}

export async function addLessonAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const sessionId = String(formData.get('sessionId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const contentType = String(formData.get('contentType') ?? '') as ContentType;
  const kind = String(formData.get('kind') ?? '') as LessonKind;
  const content = String(formData.get('content') ?? '').trim();

  const moduleSession = await assertOwnsSession(session.userId, sessionId);
  if (!moduleSession) return { error: 'Session not found.' };
  if (!title || !Object.values(ContentType).includes(contentType)) {
    return { error: 'Give the lesson a title and content type.' };
  }
  if (!Object.values(LessonKind).includes(kind)) {
    return { error: 'Pick what kind of content block this is.' };
  }

  const count = await prisma.lesson.count({ where: { sessionId } });
  const lesson = await prisma.lesson.create({
    data: { sessionId, title, contentType, kind, content: content || null, order: count + 1 },
  });
  await logAudit({
    actorId: session.userId,
    action: 'lesson.create',
    targetType: 'Lesson',
    targetId: lesson.id,
  });

  revalidatePath(`/editor/modules/${moduleSession.moduleId}`);
  return { success: `Added lesson "${title}".` };
}

export async function addAssignmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const sessionId = String(formData.get('sessionId') ?? '');
  const instructions = String(formData.get('instructions') ?? '').trim();
  const submissionType = String(formData.get('submissionType') ?? '') as SubmissionType;
  const dueDate = String(formData.get('dueDate') ?? '');
  const isAdvancedMaterial = formData.get('isAdvancedMaterial') === 'on';

  const moduleSession = await assertOwnsSession(session.userId, sessionId);
  if (!moduleSession) return { error: 'Session not found.' };
  if (!instructions || !Object.values(SubmissionType).includes(submissionType)) {
    return { error: 'Give the assignment instructions and a submission type.' };
  }

  const assignment = await prisma.assignment.create({
    data: {
      sessionId,
      instructions,
      submissionType,
      isAdvancedMaterial,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  await logAudit({
    actorId: session.userId,
    action: 'assignment.create',
    targetType: 'Assignment',
    targetId: assignment.id,
  });

  revalidatePath(`/editor/modules/${moduleSession.moduleId}`);
  return { success: 'Added assignment.' };
}

/**
 * Sets (or clears) the module a Student must finish before this one unlocks.
 * Walks the existing prerequisite chain first: without that check an editor
 * could point A at B while B already points at A, and `isModuleUnlockedForUser`
 * would then never unlock either one.
 */
export async function setModulePrerequisiteAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const moduleId = String(formData.get('moduleId') ?? '');
  const prerequisiteModuleId = String(formData.get('prerequisiteModuleId') ?? '').trim();

  if (!(await assertOwnsModule(session.userId, moduleId))) {
    return { error: 'Module not found.' };
  }

  if (prerequisiteModuleId) {
    if (prerequisiteModuleId === moduleId) {
      return { error: 'A module cannot require itself.' };
    }
    if (!(await assertOwnsModule(session.userId, prerequisiteModuleId))) {
      return { error: 'That prerequisite module is not one of yours.' };
    }

    const cyclic = await wouldCreatePrerequisiteCycle(
      moduleId,
      prerequisiteModuleId,
      async (id) =>
        (
          await prisma.module.findUnique({
            where: { id },
            select: { prerequisiteModuleId: true },
          })
        )?.prerequisiteModuleId ?? null,
    );
    if (cyclic) {
      return { error: 'That would create a circular prerequisite.' };
    }
  }

  await prisma.module.update({
    where: { id: moduleId },
    data: { prerequisiteModuleId: prerequisiteModuleId || null },
  });
  await logAudit({
    actorId: session.userId,
    action: 'module.prerequisite.set',
    targetType: 'Module',
    targetId: moduleId,
  });

  revalidatePath(`/editor/modules/${moduleId}`);
  return { success: prerequisiteModuleId ? 'Prerequisite saved.' : 'Prerequisite cleared.' };
}

/** Publishing a module makes it visible platform-wide to every Student holding All-Access. */
export async function setModulePublishedAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const moduleId = String(formData.get('moduleId') ?? '');
  const isPublished = formData.get('isPublished') === 'true';

  const module_ = await assertOwnsModule(session.userId, moduleId);
  if (!module_) return { error: 'Module not found.' };

  await prisma.module.update({ where: { id: moduleId }, data: { isPublished } });
  await logAudit({
    actorId: session.userId,
    action: isPublished ? 'module.publish' : 'module.unpublish',
    targetType: 'Module',
    targetId: moduleId,
  });

  revalidatePath(`/editor/modules/${moduleId}`);
  revalidatePath('/editor/modules');
  return { success: isPublished ? 'Published.' : 'Unpublished.' };
}
