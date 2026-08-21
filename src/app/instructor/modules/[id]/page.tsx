import { notFound } from 'next/navigation';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import { AddAssignmentForm } from './add-assignment-form';
import { AddLessonForm } from './add-lesson-form';
import { PublishForm } from './publish-form';

export default async function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(Role.Instructor);
  const { id } = await params;

  const module_ = await prisma.module.findFirst({
    where: { id, createdByInstructorId: session.userId },
    include: {
      lessons: { orderBy: { order: 'asc' } },
      assignments: true,
      publications: { include: { cohort: { include: { tenant: true } } } },
    },
  });
  if (!module_) notFound();

  const publishedCohortIds = new Set(module_.publications.map((pub) => pub.cohortId));
  const availableCohorts = await prisma.cohort.findMany({
    where: {
      tenant: { instructorTenantAssignments: { some: { instructorId: session.userId } } },
      id: { notIn: [...publishedCohortIds] },
    },
    include: { tenant: true },
  });

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
          Lessons ({module_.lessons.length})
        </h2>
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
          {module_.lessons.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">No lessons yet.</li>
          ) : (
            module_.lessons.map((lesson) => (
              <li key={lesson.id} className="px-4 py-3">
                <p className="text-sm font-medium">
                  {lesson.order}. {lesson.title}
                </p>
                <p className="text-xs text-muted-foreground">{lesson.contentType}</p>
              </li>
            ))
          )}
        </ul>
        <div className="mt-3">
          <AddLessonForm moduleId={module_.id} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground">
          Assignments ({module_.assignments.length})
        </h2>
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
          {module_.assignments.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">No assignments yet.</li>
          ) : (
            module_.assignments.map((assignment) => (
              <li key={assignment.id} className="px-4 py-3">
                <p className="text-sm font-medium">{assignment.instructions}</p>
                <p className="text-xs text-muted-foreground">
                  {assignment.submissionType}
                  {assignment.dueDate ? ` · due ${assignment.dueDate.toLocaleDateString()}` : ''}
                </p>
              </li>
            ))
          )}
        </ul>
        <div className="mt-3">
          <AddAssignmentForm moduleId={module_.id} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground">
          Published to ({module_.publications.length})
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {module_.publications.map((pub) => (
            <li key={pub.id} className="rounded-full border border-border px-3 py-1 text-sm">
              {pub.cohort.name} ({pub.cohort.tenant.name})
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <PublishForm
            moduleId={module_.id}
            cohorts={availableCohorts.map((cohort) => ({
              id: cohort.id,
              name: cohort.name,
              tenantName: cohort.tenant.name,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
