'use server';

import { revalidatePath } from 'next/cache';

import { AssignmentStatus, Role, SubmissionStatus } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export type ActionState = { error?: string; success?: string };

async function assertPublishedToEmployee(userId: string, moduleId: string) {
  return prisma.module.findFirst({
    where: {
      id: moduleId,
      publications: { some: { cohort: { members: { some: { userId } } } } },
    },
  });
}

/**
 * ProgressRecord tracks a simple lessons-completed counter, not which specific
 * lesson — so lessons are treated as an ordered checklist and this just moves
 * to the next one, capped at the module's lesson count.
 */
export async function markNextLessonCompleteAction(formData: FormData): Promise<void> {
  const session = await requireRole(Role.Employee);
  const moduleId = String(formData.get('moduleId') ?? '');

  const module_ = await assertPublishedToEmployee(session.userId, moduleId);
  if (!module_) return;

  const lessonCount = await prisma.lesson.count({ where: { moduleId } });

  const existing = await prisma.progressRecord.findUnique({
    where: { userId_moduleId: { userId: session.userId, moduleId } },
  });
  const nextCount = Math.min((existing?.lessonsCompletedCount ?? 0) + 1, lessonCount);

  await prisma.progressRecord.upsert({
    where: { userId_moduleId: { userId: session.userId, moduleId } },
    create: {
      userId: session.userId,
      moduleId,
      lessonsCompletedCount: nextCount,
      lastActivityAt: new Date(),
    },
    update: { lessonsCompletedCount: nextCount, lastActivityAt: new Date() },
  });

  revalidatePath(`/employee/modules/${moduleId}`);
}

export async function submitAssignmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Employee);

  const assignmentId = String(formData.get('assignmentId') ?? '');
  const content = String(formData.get('content') ?? '').trim();

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      module: {
        publications: { some: { cohort: { members: { some: { userId: session.userId } } } } },
      },
    },
  });
  if (!assignment) return { error: 'Assignment not found.' };
  if (!content) return { error: 'Enter your submission.' };

  await prisma.submission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: session.userId } },
    create: { assignmentId, userId: session.userId, content },
    update: { content, status: SubmissionStatus.Pending, submittedAt: new Date() },
  });

  await prisma.progressRecord.upsert({
    where: { userId_moduleId: { userId: session.userId, moduleId: assignment.moduleId } },
    create: {
      userId: session.userId,
      moduleId: assignment.moduleId,
      assignmentStatus: AssignmentStatus.Pending,
      lastActivityAt: new Date(),
    },
    update: { assignmentStatus: AssignmentStatus.Pending, lastActivityAt: new Date() },
  });

  revalidatePath(`/employee/modules/${assignment.moduleId}`);
  revalidatePath('/employee/assignments');
  return { success: 'Submitted.' };
}
