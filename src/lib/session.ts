import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { Role } from '@/generated/prisma/client/enums';
import { auth } from '@/lib/auth';
import { roleHome } from '@/lib/roles';

export type AppSession = {
  userId: string;
  name: string;
  email: string;
  role: Role;
};

/**
 * Resolves the current request's session.
 *
 * Wrapped in React's per-request `cache()` - every layout and page in a route
 * tree calls this independently, and without memoization each one re-runs
 * `auth.api.getSession` separately. `cache()` makes every call within one
 * request share the result.
 */
export const getAppSession = cache(async (): Promise<AppSession | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = session.user as typeof session.user & { role: Role };

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
});

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

  return session;
}
