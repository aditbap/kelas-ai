import type { ReactNode } from 'react';

import { hasAllAccess } from '@/lib/access';
import { AppShell } from '@/components/app-shell';
import { Role } from '@/generated/prisma/client/enums';
import { requireRole } from '@/lib/session';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(Role.Student);
  const hasAccess = await hasAllAccess(session.userId);

  return (
    <AppShell session={session} role="student" hasAllAccess={hasAccess}>
      {children}
    </AppShell>
  );
}
