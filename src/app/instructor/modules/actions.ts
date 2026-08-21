'use server';

import { revalidatePath } from 'next/cache';

import { ContentType, Role, SubmissionType } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export type ActionState = { error?: string; success?: string };

async function assertOwnsModule(instructorId: string, moduleId: string) {
  return prisma.module.findFirst({ where: { id: moduleId, createdByInstructorId: instructorId } });
}

export async function createModuleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Instructor);

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!title) return { error: 'Give the module a title.' };

  const module_ = await prisma.module.create({
    data: { title, description: description || null, createdByInstructorId: session.userId },
  });

  revalidatePath('/instructor/modules');
  return { success: `Created "${module_.title}".` };
}

export async function addLessonAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Instructor);

  const moduleId = String(formData.get('moduleId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const contentType = String(formData.get('contentType') ?? '') as ContentType;
  const content = String(formData.get('content') ?? '').trim();

  if (!(await assertOwnsModule(session.userId, moduleId))) {
    return { error: 'Module not found.' };
  }
  if (!title || !Object.values(ContentType).includes(contentType)) {
    return { error: 'Give the lesson a title and content type.' };
  }

  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: { moduleId, title, contentType, content: content || null, order: count + 1 },
  });

  revalidatePath(`/instructor/modules/${moduleId}`);
  return { success: `Added lesson "${title}".` };
}

export async function addAssignmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Instructor);

  const moduleId = String(formData.get('moduleId') ?? '');
  const instructions = String(formData.get('instructions') ?? '').trim();
  const submissionType = String(formData.get('submissionType') ?? '') as SubmissionType;
  const dueDate = String(formData.get('dueDate') ?? '');

  if (!(await assertOwnsModule(session.userId, moduleId))) {
    return { error: 'Module not found.' };
  }
  if (!instructions || !Object.values(SubmissionType).includes(submissionType)) {
    return { error: 'Give the assignment instructions and a submission type.' };
  }

  await prisma.assignment.create({
    data: {
      moduleId,
      instructions,
      submissionType,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath(`/instructor/modules/${moduleId}`);
  return { success: 'Added assignment.' };
}

export async function publishToCohortAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Instructor);

  const moduleId = String(formData.get('moduleId') ?? '');
  const cohortId = String(formData.get('cohortId') ?? '');

  if (!(await assertOwnsModule(session.userId, moduleId))) {
    return { error: 'Module not found.' };
  }

  const cohort = await prisma.cohort.findFirst({
    where: {
      id: cohortId,
      tenant: { instructorTenantAssignments: { some: { instructorId: session.userId } } },
    },
  });
  if (!cohort) return { error: "That cohort isn't in one of your assigned tenants." };

  await prisma.moduleCohortPublication.upsert({
    where: { moduleId_cohortId: { moduleId, cohortId } },
    create: { moduleId, cohortId },
    update: {},
  });

  revalidatePath(`/instructor/modules/${moduleId}`);
  return { success: `Published to ${cohort.name}.` };
}
