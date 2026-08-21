import { prisma } from '@/lib/db';

export async function logAudit(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
}) {
  await prisma.auditLog.create({ data: params });
}
