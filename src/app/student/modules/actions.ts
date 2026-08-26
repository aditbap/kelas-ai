'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { AssignmentStatus, Role, SubmissionStatus } from '@/generated/prisma/client/enums';
import { hasAllAccess } from '@/lib/access';
import { prisma } from '@/lib/db';
import { isModuleUnlockedForUser } from '@/lib/module-completion';
import { requireRole } from '@/lib/session';

import type { ActionState } from '@/lib/actions';
export type { ActionState };

/** A session is reachable only if the student has All-Access, it's published, and its module isn't prerequisite-locked. */
async function assertSessionAccessible(userId: string, sessionId: string) {
  if (!(await hasAllAccess(userId))) return null;

  const moduleSession = await prisma.moduleSession.findFirst({
    where: { id: sessionId, module: { isPublished: true } },
    include: { module: true },
  });
  if (!moduleSession) return null;
  if (!(await isModuleUnlockedForUser(userId, moduleSession.module))) return null;
  return moduleSession;
}

/**
 * Backs the course player's "Go to next item" button. SessionProgress tracks
 * a simple lessons-completed counter, not which specific lesson - so lessons
 * are treated as an ordered checklist and this just moves to the next one
 * (capped at the session's lesson count), then redirects to the next item.
 */
export async function completeLessonAndAdvanceAction(formData: FormData): Promise<void> {
  const session = await requireRole(Role.Student);
  const sessionId = String(formData.get('sessionId') ?? '');
  const nextHref = String(formData.get('nextHref') ?? '');

  const moduleSession = await assertSessionAccessible(session.userId, sessionId);
  if (moduleSession) {
    const lessonCount = await prisma.lesson.count({ where: { sessionId } });

    const existing = await prisma.sessionProgress.findUnique({
      where: { userId_sessionId: { userId: session.userId, sessionId } },
    });
    const nextCount = Math.min((existing?.lessonsCompletedCount ?? 0) + 1, lessonCount);

    await prisma.sessionProgress.upsert({
      where: { userId_sessionId: { userId: session.userId, sessionId } },
      create: {
        userId: session.userId,
        sessionId,
        lessonsCompletedCount: nextCount,
        lastActivityAt: new Date(),
      },
      update: { lessonsCompletedCount: nextCount, lastActivityAt: new Date() },
    });

    revalidatePath(`/student/modules/${moduleSession.moduleId}`);
  }

  redirect(nextHref);
}

export async function submitAssignmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Student);

  const assignmentId = String(formData.get('assignmentId') ?? '');
  const content = String(formData.get('content') ?? '').trim();

  if (!(await hasAllAccess(session.userId))) {
    return { error: 'Get All-Access to submit assignments.' };
  }

  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, session: { module: { isPublished: true } } },
    include: { session: { include: { module: true } } },
  });
  if (!assignment) return { error: 'Assignment not found.' };
  if (!(await isModuleUnlockedForUser(session.userId, assignment.session.module))) {
    return { error: 'Complete the prerequisite module first.' };
  }
  if (!content) return { error: 'Enter your submission.' };

  await prisma.submission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: session.userId } },
    create: { assignmentId, userId: session.userId, content },
    update: { content, status: SubmissionStatus.Pending, submittedAt: new Date() },
  });

  await prisma.sessionProgress.upsert({
    where: { userId_sessionId: { userId: session.userId, sessionId: assignment.sessionId } },
    create: {
      userId: session.userId,
      sessionId: assignment.sessionId,
      assignmentStatus: AssignmentStatus.Pending,
      lastActivityAt: new Date(),
    },
    update: { assignmentStatus: AssignmentStatus.Pending, lastActivityAt: new Date() },
  });

  revalidatePath(`/student/modules/${assignment.session.moduleId}`);
  revalidatePath('/student/assignments');
  return { success: 'Submitted.' };
}
