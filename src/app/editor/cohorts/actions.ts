'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { Role } from '@/generated/prisma/client/enums';
import { logAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import type { ActionState } from '@/lib/actions';
export type { ActionState };

export async function createCohortAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const name = String(formData.get('name') ?? '').trim();
  const onsiteDate = String(formData.get('onsiteDate') ?? '');

  if (!name || !onsiteDate) {
    return { error: 'Fill in a name and onsite date.' };
  }

  const cohort = await prisma.cohort.create({
    data: { editorId: session.userId, name, onsiteDate: new Date(onsiteDate) },
  });
  await logAudit({
    actorId: session.userId,
    action: 'cohort.create',
    targetType: 'Cohort',
    targetId: cohort.id,
  });

  revalidatePath('/editor/cohorts');
  return { success: `Created cohort "${name}".` };
}

export async function updateCohortAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const cohortId = String(formData.get('cohortId') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const onsiteDate = String(formData.get('onsiteDate') ?? '');

  if (!name || !onsiteDate) {
    return { error: 'Fill in a name and onsite date.' };
  }

  const cohort = await prisma.cohort.findFirst({
    where: { id: cohortId, editorId: session.userId },
  });
  if (!cohort) return { error: 'Cohort not found.' };

  await prisma.cohort.update({
    where: { id: cohortId },
    data: { name, onsiteDate: new Date(onsiteDate) },
  });
  await logAudit({
    actorId: session.userId,
    action: 'cohort.update',
    targetType: 'Cohort',
    targetId: cohortId,
  });

  revalidatePath(`/editor/cohorts/${cohortId}`);
  revalidatePath('/editor/cohorts');
  return { success: 'Cohort updated.' };
}

export async function deleteCohortAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const cohortId = String(formData.get('cohortId') ?? '');
  const cohort = await prisma.cohort.findFirst({
    where: { id: cohortId, editorId: session.userId },
  });
  if (!cohort) return { error: 'Cohort not found.' };

  await prisma.cohort.delete({ where: { id: cohortId } });
  await logAudit({
    actorId: session.userId,
    action: 'cohort.delete',
    targetType: 'Cohort',
    targetId: cohortId,
  });

  revalidatePath('/editor/cohorts');
  redirect('/editor/cohorts');
}

/** Adds a student to the cohort roster directly, by email. */
export async function addCohortMemberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const cohortId = String(formData.get('cohortId') ?? '');
  const email = String(formData.get('email') ?? '').trim();

  const cohort = await prisma.cohort.findFirst({
    where: { id: cohortId, editorId: session.userId },
  });
  const student = await prisma.user.findFirst({ where: { email, role: Role.Student } });
  if (!cohort || !student) {
    return { error: 'Cohort not found, or no student with that email.' };
  }

  await prisma.cohortMember.upsert({
    where: { cohortId_userId: { cohortId, userId: student.id } },
    create: { cohortId, userId: student.id },
    update: {},
  });
  await logAudit({
    actorId: session.userId,
    action: 'cohort.member.add',
    targetType: 'Cohort',
    targetId: cohortId,
  });

  revalidatePath(`/editor/cohorts/${cohortId}`);
  return { success: `Added ${student.name} to the cohort.` };
}

export async function removeCohortMemberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const cohortId = String(formData.get('cohortId') ?? '');
  const userId = String(formData.get('userId') ?? '');

  const cohort = await prisma.cohort.findFirst({
    where: { id: cohortId, editorId: session.userId },
  });
  if (!cohort) return { error: 'Cohort not found.' };

  await prisma.cohortMember.deleteMany({ where: { cohortId, userId } });
  await logAudit({
    actorId: session.userId,
    action: 'cohort.member.remove',
    targetType: 'Cohort',
    targetId: cohortId,
  });
  revalidatePath(`/editor/cohorts/${cohortId}`);
  return { success: 'Removed.' };
}
