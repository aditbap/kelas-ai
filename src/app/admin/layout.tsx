import type { ReactNode } from 'react';

import { AppShell, type NavItem } from '@/components/app-shell';
import { Role } from '@/generated/prisma/client/enums';
import { requireRole } from '@/lib/session';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Team Roster', enabled: false },
  { label: 'Team Progress', enabled: false },
  { label: 'Billing', enabled: false },
];

export default async function CompanyAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(Role.CompanyAdmin);

  return (
    <AppShell session={session} roleLabel="Company Admin" navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
