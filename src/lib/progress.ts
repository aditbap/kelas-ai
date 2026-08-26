import { AssignmentStatus } from '@/generated/prisma/client/enums';

/**
 * A session is "complete" when every lesson is viewed AND (if the session has
 * an assignment) it's graded - not just when the assignment is graded, which
 * could show 0% for someone who'd finished every lesson in a session whose
 * assignment just hasn't been graded yet.
 */
export function computeSessionCompletionPercent(
  progress: { lessonsCompletedCount: number; assignmentStatus: AssignmentStatus },
  session: { totalLessons: number; hasAssignment: boolean },
): number {
  const totalItems = session.totalLessons + (session.hasAssignment ? 1 : 0);
  if (totalItems === 0) return 0;

  const completedLessons = Math.min(progress.lessonsCompletedCount, session.totalLessons);
  const completedAssignment =
    session.hasAssignment && progress.assignmentStatus === AssignmentStatus.Graded ? 1 : 0;

  return Math.round(((completedLessons + completedAssignment) / totalItems) * 100);
}

/** Unweighted average of a set of completion percentages, rounded to a whole percent. */
export function average(percents: number[]): number {
  if (percents.length === 0) return 0;
  return Math.round(percents.reduce((sum, percent) => sum + percent, 0) / percents.length);
}
