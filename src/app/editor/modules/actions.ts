'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

async function assertOwnsLesson(editorId: string, lessonId: string) {
  return prisma.lesson.findFirst({
    where: { id: lessonId, session: { module: { createdByEditorId: editorId } } },
  });
}

async function assertOwnsAssignment(editorId: string, assignmentId: string) {
  return prisma.assignment.findFirst({
    where: { id: assignmentId, session: { module: { createdByEditorId: editorId } } },
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
  redirect(`/editor/modules/${module_.id}`);
}

export async function updateModuleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const moduleId = String(formData.get('moduleId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!(await assertOwnsModule(session.userId, moduleId))) {
    return { error: 'Module not found.' };
  }
  if (!title) return { error: 'Give the module a title.' };

  await prisma.module.update({
    where: { id: moduleId },
    data: { title, description: description || null },
  });
  await logAudit({
    actorId: session.userId,
    action: 'module.update',
    targetType: 'Module',
    targetId: moduleId,
  });

  revalidatePath(`/editor/modules/${moduleId}`);
  return { success: 'Module updated.' };
}

export async function deleteModuleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const moduleId = String(formData.get('moduleId') ?? '');
  const module_ = await assertOwnsModule(session.userId, moduleId);
  if (!module_) return { error: 'Module not found.' };

  await prisma.module.delete({ where: { id: moduleId } });
  await logAudit({
    actorId: session.userId,
    action: 'module.delete',
    targetType: 'Module',
    targetId: moduleId,
  });

  revalidatePath('/editor/modules');
  redirect('/editor/modules');
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

export async function updateSessionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const sessionId = String(formData.get('sessionId') ?? '');
  const title = String(formData.get('title') ?? '').trim();

  const moduleSession = await assertOwnsSession(session.userId, sessionId);
  if (!moduleSession) return { error: 'Session not found.' };
  if (!title) return { error: 'Give the session a title.' };

  await prisma.moduleSession.update({ where: { id: sessionId }, data: { title } });
  await logAudit({
    actorId: session.userId,
    action: 'session.update',
    targetType: 'ModuleSession',
    targetId: sessionId,
  });

  revalidatePath(`/editor/modules/${moduleSession.moduleId}`);
  return { success: 'Session updated.' };
}

export async function deleteSessionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const sessionId = String(formData.get('sessionId') ?? '');
  const moduleSession = await assertOwnsSession(session.userId, sessionId);
  if (!moduleSession) return { error: 'Session not found.' };

  await prisma.moduleSession.delete({ where: { id: sessionId } });
  await logAudit({
    actorId: session.userId,
    action: 'session.delete',
    targetType: 'ModuleSession',
    targetId: sessionId,
  });

  revalidatePath(`/editor/modules/${moduleSession.moduleId}`);
  redirect(`/editor/modules/${moduleSession.moduleId}`);
}

/** Swaps this session's `order` with its immediate neighbor in the given direction. */
export async function moveSessionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const sessionId = String(formData.get('sessionId') ?? '');
  const direction = String(formData.get('direction') ?? '');

  const moduleSession = await assertOwnsSession(session.userId, sessionId);
  if (!moduleSession) return { error: 'Session not found.' };

  const neighbor = await prisma.moduleSession.findFirst({
    where: {
      moduleId: moduleSession.moduleId,
      order: direction === 'up' ? { lt: moduleSession.order } : { gt: moduleSession.order },
    },
    orderBy: { order: direction === 'up' ? 'desc' : 'asc' },
  });
  if (!neighbor) return { success: 'Already at the edge.' };

  await prisma.$transaction([
    prisma.moduleSession.update({ where: { id: moduleSession.id }, data: { order: -1 } }),
    prisma.moduleSession.update({
      where: { id: neighbor.id },
      data: { order: moduleSession.order },
    }),
    prisma.moduleSession.update({
      where: { id: moduleSession.id },
      data: { order: neighbor.order },
    }),
  ]);

  revalidatePath(`/editor/modules/${moduleSession.moduleId}`);
  return { success: 'Reordered.' };
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

export async function updateLessonAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const lessonId = String(formData.get('lessonId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const contentType = String(formData.get('contentType') ?? '') as ContentType;
  const kind = String(formData.get('kind') ?? '') as LessonKind;
  const content = String(formData.get('content') ?? '').trim();

  const lesson = await assertOwnsLesson(session.userId, lessonId);
  if (!lesson) return { error: 'Lesson not found.' };
  if (!title || !Object.values(ContentType).includes(contentType)) {
    return { error: 'Give the lesson a title and content type.' };
  }
  if (!Object.values(LessonKind).includes(kind)) {
    return { error: 'Pick what kind of content block this is.' };
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { title, contentType, kind, content: content || null },
  });
  const moduleSession = await prisma.moduleSession.findUniqueOrThrow({
    where: { id: lesson.sessionId },
  });
  await logAudit({
    actorId: session.userId,
    action: 'lesson.update',
    targetType: 'Lesson',
    targetId: lessonId,
  });

  revalidatePath(`/editor/modules/${moduleSession.moduleId}`);
  return { success: `Updated lesson "${title}".` };
}

export async function deleteLessonAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const lessonId = String(formData.get('lessonId') ?? '');
  const lesson = await assertOwnsLesson(session.userId, lessonId);
  if (!lesson) return { error: 'Lesson not found.' };

  const moduleSession = await prisma.moduleSession.findUniqueOrThrow({
    where: { id: lesson.sessionId },
  });
  await prisma.lesson.delete({ where: { id: lessonId } });
  await logAudit({
    actorId: session.userId,
    action: 'lesson.delete',
    targetType: 'Lesson',
    targetId: lessonId,
  });

  revalidatePath(`/editor/modules/${moduleSession.moduleId}`);
  return { success: 'Lesson deleted.' };
}

/** Swaps this lesson's `order` with its immediate neighbor in the given direction. */
export async function moveLessonAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const lessonId = String(formData.get('lessonId') ?? '');
  const direction = String(formData.get('direction') ?? '');

  const lesson = await assertOwnsLesson(session.userId, lessonId);
  if (!lesson) return { error: 'Lesson not found.' };

  const moduleSession = await prisma.moduleSession.findUniqueOrThrow({
    where: { id: lesson.sessionId },
  });
  const neighbor = await prisma.lesson.findFirst({
    where: {
      sessionId: lesson.sessionId,
      order: direction === 'up' ? { lt: lesson.order } : { gt: lesson.order },
    },
    orderBy: { order: direction === 'up' ? 'desc' : 'asc' },
  });
  if (!neighbor) return { success: 'Already at the edge.' };

  await prisma.$transaction([
    prisma.lesson.update({ where: { id: lesson.id }, data: { order: -1 } }),
    prisma.lesson.update({ where: { id: neighbor.id }, data: { order: lesson.order } }),
    prisma.lesson.update({ where: { id: lesson.id }, data: { order: neighbor.order } }),
  ]);

  revalidatePath(`/editor/modules/${moduleSession.moduleId}`);
  return { success: 'Reordered.' };
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

export async function updateAssignmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const assignmentId = String(formData.get('assignmentId') ?? '');
  const instructions = String(formData.get('instructions') ?? '').trim();
  const submissionType = String(formData.get('submissionType') ?? '') as SubmissionType;
  const dueDate = String(formData.get('dueDate') ?? '');
  const isAdvancedMaterial = formData.get('isAdvancedMaterial') === 'on';

  const assignment = await assertOwnsAssignment(session.userId, assignmentId);
  if (!assignment) return { error: 'Assignment not found.' };
  if (!instructions || !Object.values(SubmissionType).includes(submissionType)) {
    return { error: 'Give the assignment instructions and a submission type.' };
  }

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      instructions,
      submissionType,
      isAdvancedMaterial,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  const moduleSession = await prisma.moduleSession.findUniqueOrThrow({
    where: { id: assignment.sessionId },
  });
  await logAudit({
    actorId: session.userId,
    action: 'assignment.update',
    targetType: 'Assignment',
    targetId: assignmentId,
  });

  revalidatePath(`/editor/modules/${moduleSession.moduleId}`);
  return { success: 'Assignment updated.' };
}

export async function deleteAssignmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const assignmentId = String(formData.get('assignmentId') ?? '');
  const assignment = await assertOwnsAssignment(session.userId, assignmentId);
  if (!assignment) return { error: 'Assignment not found.' };

  const moduleSession = await prisma.moduleSession.findUniqueOrThrow({
    where: { id: assignment.sessionId },
  });
  await prisma.assignment.delete({ where: { id: assignmentId } });
  await logAudit({
    actorId: session.userId,
    action: 'assignment.delete',
    targetType: 'Assignment',
    targetId: assignmentId,
  });

  revalidatePath(`/editor/modules/${moduleSession.moduleId}`);
  return { success: 'Assignment deleted.' };
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
