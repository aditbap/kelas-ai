import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { Role } from '@/generated/prisma/client/enums';
import type { SessionContext } from '@/lib/authz';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { roleHome } from '@/lib/roles';

export type AppSession = SessionContext & {
  name: string;
  email: string;
};

/**
 * Resolves the current request's session and, for Instructors, their tenant
 * assignments — producing the exact shape `getTenantScopedClient` (src/lib/authz.ts)
 * expects, so route handlers/server actions can go straight from session to a
 * safely tenant-scoped Prisma client.
 */
export async function getAppSession(): Promise<AppSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = session.user as typeof session.user & { role: Role; tenantId: string | null };

  let assignedTenantIds: string[] | undefined;
  if (user.role === Role.Instructor) {
    const assignments = await prisma.instructorTenantAssignment.findMany({
      where: { instructorId: user.id },
      select: { tenantId: true },
    });
    assignedTenantIds = assignments.map((a) => a.tenantId);
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    assignedTenantIds,
  };
}

export { roleHome };

/**
 * Server-component guard: redirects to /login when unauthenticated, or to the
 * caller's own dashboard when authenticated but holding the wrong role.
 */
export async function requireRole(allowed: Role | Role[]): Promise<AppSession> {
  const session = await getAppSession();
  if (!session) redirect('/login');

  const roles = Array.isArray(allowed) ? allowed : [allowed];
  if (!roles.includes(session.role)) redirect(roleHome(session.role));

  if (session.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
    if (tenant?.status === 'Suspended') redirect('/login?suspended=1');
  }

  return session;
}
