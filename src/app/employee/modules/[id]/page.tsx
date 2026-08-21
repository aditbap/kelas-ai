import { notFound } from 'next/navigation';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import { markNextLessonCompleteAction } from '../actions';
import { SubmitAssignmentForm } from './submit-assignment-form';

export default async function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(Role.Employee);
  const { id } = await params;

  const module_ = await prisma.module.findFirst({
    where: {
      id,
      publications: { some: { cohort: { members: { some: { userId: session.userId } } } } },
    },
    include: {
      lessons: { orderBy: { order: 'asc' } },
      assignments: {
        include: { submissions: { where: { userId: session.userId }, include: { grade: true } } },
      },
    },
  });
  if (!module_) notFound();

  const progress = await prisma.progressRecord.findUnique({
    where: { userId_moduleId: { userId: session.userId, moduleId: module_.id } },
  });
  const completedCount = progress?.lessonsCompletedCount ?? 0;
  const allLessonsDone = completedCount >= module_.lessons.length;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{module_.title}</h1>
        {module_.description ? (
          <p className="mt-1 text-muted-foreground">{module_.description}</p>
        ) : null}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground">
          Lessons ({completedCount}/{module_.lessons.length} done)
        </h2>
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
          {module_.lessons.map((lesson, index) => (
            <li key={lesson.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{lesson.title}</p>
                <p className="text-xs text-muted-foreground">{lesson.contentType}</p>
              </div>
              {index < completedCount ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Done
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        {!allLessonsDone && module_.lessons.length > 0 ? (
          <form action={markNextLessonCompleteAction} className="mt-3">
            <input type="hidden" name="moduleId" value={module_.id} />
            <button type="submit" className="text-sm font-medium text-primary hover:underline">
              Mark next lesson complete
            </button>
          </form>
        ) : null}
      </div>

      {module_.assignments.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground">Assignments</h2>
          <ul className="mt-2 space-y-4">
            {module_.assignments.map((assignment) => {
              const submission = assignment.submissions[0];
              return (
                <li key={assignment.id} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">{assignment.instructions}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {assignment.submissionType}
                    {assignment.dueDate ? ` · due ${assignment.dueDate.toLocaleDateString()}` : ''}
                  </p>

                  {submission?.grade ? (
                    <div className="mt-2 rounded-md bg-primary/10 p-3 text-sm">
                      <p className="font-medium text-primary">
                        Graded{submission.grade.score != null ? `: ${submission.grade.score}` : ''}
                        {submission.grade.passFail != null
                          ? ` (${submission.grade.passFail ? 'Pass' : 'Fail'})`
                          : ''}
                      </p>
                      {submission.grade.feedbackText ? (
                        <p className="mt-1 text-muted-foreground">
                          {submission.grade.feedbackText}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <SubmitAssignmentForm
                      assignmentId={assignment.id}
                      submissionType={assignment.submissionType}
                      existingContent={submission?.content}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
