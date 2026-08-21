'use server';

import { revalidatePath } from 'next/cache';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export type ActionState = { error?: string; success?: string };

export async function createCohortAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.CompanyAdmin);
  if (!session.tenantId) return { error: 'No workspace found for this account.' };

  const name = String(formData.get('name') ?? '').trim();
  const onsiteDate = String(formData.get('onsiteDate') ?? '');
  const instructorId = String(formData.get('instructorId') ?? '');

  if (!name || !onsiteDate || !instructorId) {
    return { error: 'Fill in a name, onsite date, and instructor.' };
  }

  const assignment = await prisma.instructorTenantAssignment.findUnique({
    where: { instructorId_tenantId: { instructorId, tenantId: session.tenantId } },
  });
  if (!assignment) {
    return { error: 'That instructor is not assigned to your workspace.' };
  }

  await prisma.cohort.create({
    data: { tenantId: session.tenantId, name, onsiteDate: new Date(onsiteDate), instructorId },
  });

  revalidatePath('/admin/cohorts');
  return { success: `Created cohort "${name}".` };
}

export async function addCohortMemberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.CompanyAdmin);
  if (!session.tenantId) return { error: 'No workspace found for this account.' };

  const cohortId = String(formData.get('cohortId') ?? '');
  const userId = String(formData.get('userId') ?? '');

  const cohort = await prisma.cohort.findFirst({
    where: { id: cohortId, tenantId: session.tenantId },
  });
  const employee = await prisma.user.findFirst({
    where: { id: userId, tenantId: session.tenantId, role: Role.Employee },
  });
  if (!cohort || !employee) {
    return { error: 'Cohort or employee not found in your workspace.' };
  }

  await prisma.cohortMember.upsert({
    where: { cohortId_userId: { cohortId, userId } },
    create: { cohortId, userId },
    update: {},
  });

  revalidatePath(`/admin/cohorts/${cohortId}`);
  return { success: `Added ${employee.name} to the cohort.` };
}

export async function removeCohortMemberAction(formData: FormData): Promise<void> {
  const session = await requireRole(Role.CompanyAdmin);
  if (!session.tenantId) return;

  const cohortId = String(formData.get('cohortId') ?? '');
  const userId = String(formData.get('userId') ?? '');

  const cohort = await prisma.cohort.findFirst({
    where: { id: cohortId, tenantId: session.tenantId },
  });
  if (!cohort) return;

  await prisma.cohortMember.deleteMany({ where: { cohortId, userId } });
  revalidatePath(`/admin/cohorts/${cohortId}`);
}
