'use server';

import { revalidatePath } from 'next/cache';

import { AssignmentStatus, Role, SubmissionStatus } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { requireRole } from '@/lib/session';

export type ActionState = { error?: string; success?: string };

export async function gradeSubmissionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Instructor);

  const submissionId = String(formData.get('submissionId') ?? '');
  const scoreRaw = String(formData.get('score') ?? '').trim();
  const passFailRaw = String(formData.get('passFail') ?? '');
  const feedbackText = String(formData.get('feedbackText') ?? '').trim();

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      assignment: {
        module: {
          publications: {
            some: {
              cohort: {
                tenant: { instructorTenantAssignments: { some: { instructorId: session.userId } } },
              },
            },
          },
        },
      },
    },
    include: { assignment: true, user: true },
  });
  if (!submission) return { error: 'Submission not found.' };

  await prisma.grade.upsert({
    where: { submissionId },
    create: {
      submissionId,
      gradedByInstructorId: session.userId,
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

  await prisma.progressRecord.upsert({
    where: {
      userId_moduleId: { userId: submission.userId, moduleId: submission.assignment.moduleId },
    },
    create: {
      userId: submission.userId,
      moduleId: submission.assignment.moduleId,
      assignmentStatus: AssignmentStatus.Graded,
      lastActivityAt: new Date(),
    },
    update: { assignmentStatus: AssignmentStatus.Graded, lastActivityAt: new Date() },
  });

  await sendEmail({
    to: submission.user.email,
    subject: 'Your assignment has been graded',
    html: `<p>Your submission for "${submission.assignment.instructions}" has been graded.${
      feedbackText ? ` Feedback: ${feedbackText}` : ''
    }</p>`,
  });

  revalidatePath('/instructor/grading');
  return { success: 'Graded and notified the student.' };
}
