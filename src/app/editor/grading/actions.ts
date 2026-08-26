'use server';

import { revalidatePath } from 'next/cache';

import { AssignmentStatus, Role, SubmissionStatus } from '@/generated/prisma/client/enums';
import { logAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { escapeHtml, sendEmail } from '@/lib/email';
import { requireRole } from '@/lib/session';

import type { ActionState } from '@/lib/actions';
export type { ActionState };

export async function gradeSubmissionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const submissionId = String(formData.get('submissionId') ?? '');
  const scoreRaw = String(formData.get('score') ?? '').trim();
  const passFailRaw = String(formData.get('passFail') ?? '');
  const feedbackText = String(formData.get('feedbackText') ?? '').trim();

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      assignment: { session: { module: { createdByEditorId: session.userId } } },
    },
    include: { assignment: true, user: true },
  });
  if (!submission) return { error: 'Submission not found.' };

  await prisma.grade.upsert({
    where: { submissionId },
    create: {
      submissionId,
      gradedByEditorId: session.userId,
      score: scoreRaw ? Number(scoreRaw) : null,
      passFail: passFailRaw ? passFailRaw === 'pass' : null,
      feedbackText: feedbackText || null,
    },
    update: {
      score: scoreRaw ? Number(scoreRaw) : null,
      passFail: passFailRaw ? passFailRaw === 'pass' : null,
      feedbackText: feedbackText || null,
      gradedAt: new Date(),
    },
  });

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: SubmissionStatus.Graded },
  });

  await prisma.sessionProgress.upsert({
    where: {
      userId_sessionId: { userId: submission.userId, sessionId: submission.assignment.sessionId },
    },
    create: {
      userId: submission.userId,
      sessionId: submission.assignment.sessionId,
      assignmentStatus: AssignmentStatus.Graded,
      lastActivityAt: new Date(),
    },
    update: { assignmentStatus: AssignmentStatus.Graded, lastActivityAt: new Date() },
  });

  await logAudit({
    actorId: session.userId,
    action: 'submission.grade',
    targetType: 'Submission',
    targetId: submissionId,
  });

  revalidatePath('/editor/grading');

  // The grade is already saved at this point - an email hiccup shouldn't make
  // the instructor think grading itself failed.
  try {
    await sendEmail({
      to: submission.user.email,
      subject: 'Your assignment has been graded',
      html: `<p>Your submission for "${escapeHtml(submission.assignment.instructions)}" has been graded.${
        feedbackText ? ` Feedback: ${escapeHtml(feedbackText)}` : ''
      }</p>`,
    });
  } catch (error) {
    console.error('Failed to send grading notification email:', error);
    return { success: 'Graded, but the notification email failed to send.' };
  }

  return { success: 'Graded and notified the student.' };
}
