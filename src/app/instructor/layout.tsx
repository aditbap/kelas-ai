import type { ReactNode } from 'react';

import { AppShell, type NavItem } from '@/components/app-shell';
import { Role } from '@/generated/prisma/client/enums';
import { requireRole } from '@/lib/session';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/instructor' },
  { label: 'Content Library', enabled: false },
  { label: 'Grading Queue', enabled: false },
  { label: 'Resource Library', enabled: false },
  { label: 'Tenant Analytics', enabled: false },
];

export default async function InstructorLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(Role.Instructor);

  return (
    <AppShell session={session} roleLabel="Instructor" navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
