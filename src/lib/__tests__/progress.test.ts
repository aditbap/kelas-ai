import { describe, it, expect } from 'vitest';

import { AssignmentStatus } from '@/generated/prisma/client/enums';
import { average, computeSessionCompletionPercent } from '@/lib/progress';

describe('computeSessionCompletionPercent', () => {
  it('is 0% for a session with no lessons and no assignment', () => {
    const percent = computeSessionCompletionPercent(
      { lessonsCompletedCount: 0, assignmentStatus: AssignmentStatus.NotStarted },
      { totalLessons: 0, hasAssignment: false },
    );
    expect(percent).toBe(0);
  });

  it('is 100% for a session with no assignment once all lessons are done', () => {
    const percent = computeSessionCompletionPercent(
      { lessonsCompletedCount: 3, assignmentStatus: AssignmentStatus.NotStarted },
      { totalLessons: 3, hasAssignment: false },
    );
    expect(percent).toBe(100);
  });

  it('does not floor at 0% just because the assignment is ungraded', () => {
    // Regression test: dashboards used to compute completion purely from
    // assignmentStatus === 'Graded', so finishing every lesson in a session
    // with a pending (ungraded) assignment showed 0% instead of partial credit.
    const percent = computeSessionCompletionPercent(
      { lessonsCompletedCount: 2, assignmentStatus: AssignmentStatus.Pending },
      { totalLessons: 2, hasAssignment: true },
    );
    expect(percent).toBe(67);
  });

  it('reaches 100% only once lessons are done and the assignment is graded', () => {
    const percent = computeSessionCompletionPercent(
      { lessonsCompletedCount: 2, assignmentStatus: AssignmentStatus.Graded },
      { totalLessons: 2, hasAssignment: true },
    );
    expect(percent).toBe(100);
  });

  it('clamps lessonsCompletedCount so it can never exceed totalLessons', () => {
    const percent = computeSessionCompletionPercent(
      { lessonsCompletedCount: 99, assignmentStatus: AssignmentStatus.NotStarted },
      { totalLessons: 2, hasAssignment: false },
    );
    expect(percent).toBe(100);
  });
});

describe('average', () => {
  it('is 0% with no percents', () => {
    expect(average([])).toBe(0);
  });

  it('averages a set of percents, rounded to a whole percent', () => {
    expect(average([100, 0])).toBe(50);
    expect(average([100, 67, 0])).toBe(56);
  });

  // A multi-session module's completion is the average of its sessions'
  // percents, and a student's overall completion is the average of their
  // modules' percents - the same reduction applied at two levels.
  it('composes: module percent from session percents, overall from module percents', () => {
    const module1Percent = average([100, 50]); // two sessions
    const module2Percent = average([0]); // one session, not started
    expect(average([module1Percent, module2Percent])).toBe(38);
  });
});
