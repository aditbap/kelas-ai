'use server';

import { revalidatePath } from 'next/cache';

import { Role } from '@/generated/prisma/client/enums';
import { logAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export type ActionState = { error?: string; success?: string };

export async function assignInstructorAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.SuperAdmin);

  const instructorId = String(formData.get('instructorId') ?? '');
  const tenantId = String(formData.get('tenantId') ?? '');

  const instructor = await prisma.user.findFirst({
    where: { id: instructorId, role: Role.Instructor },
  });
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!instructor || !tenant) return { error: 'Instructor or tenant not found.' };

  await prisma.instructorTenantAssignment.upsert({
    where: { instructorId_tenantId: { instructorId, tenantId } },
    create: { instructorId, tenantId },
    update: {},
  });

  await logAudit({
    actorId: session.userId,
    action: 'instructor.assign',
    targetType: 'InstructorTenantAssignment',
    targetId: `${instructorId}:${tenantId}`,
  });

  revalidatePath('/super-admin/instructors');
  return { success: `Assigned ${instructor.name} to ${tenant.name}.` };
}
