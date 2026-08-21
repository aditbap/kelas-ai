import type { ReactNode } from 'react';

import { AppShell, type NavItem } from '@/components/app-shell';
import { Role } from '@/generated/prisma/client/enums';
import { requireRole } from '@/lib/session';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/employee' },
  { label: 'Learning Modules', enabled: false },
  { label: 'Assignments', enabled: false },
  { label: 'My Progress', enabled: false },
  { label: 'AI Resource Library', enabled: false },
  { label: 'My Cohort', enabled: false },
];

export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(Role.Employee);

  return (
    <AppShell session={session} roleLabel="Employee" navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
