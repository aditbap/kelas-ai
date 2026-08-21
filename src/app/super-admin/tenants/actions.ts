'use server';

import { revalidatePath } from 'next/cache';

import { Role, TenantStatus } from '@/generated/prisma/client/enums';
import { logAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export async function toggleTenantStatusAction(formData: FormData): Promise<void> {
  const session = await requireRole(Role.SuperAdmin);
  const tenantId = String(formData.get('tenantId') ?? '');

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return;

  const nextStatus =
    tenant.status === TenantStatus.Active ? TenantStatus.Suspended : TenantStatus.Active;

  await prisma.tenant.update({ where: { id: tenantId }, data: { status: nextStatus } });
  await logAudit({
    actorId: session.userId,
    action: nextStatus === TenantStatus.Suspended ? 'tenant.suspend' : 'tenant.reactivate',
    targetType: 'Tenant',
    targetId: tenantId,
  });

  revalidatePath('/super-admin/tenants');
}
