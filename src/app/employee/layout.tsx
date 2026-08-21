import type { ReactNode } from 'react';

import { AppShell, type NavItem } from '@/components/app-shell';
import { Role } from '@/generated/prisma/client/enums';
import { requireRole } from '@/lib/session';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/employee' },
  { label: 'Learning Modules', href: '/employee/modules' },
  { label: 'Assignments', href: '/employee/assignments' },
  { label: 'My Progress', href: '/employee/progress' },
  { label: 'AI Resource Library', href: '/employee/resources' },
  { label: 'My Cohort', href: '/employee/cohort' },
];

export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(Role.Employee);

  return (
    <AppShell session={session} roleLabel="Employee" navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
