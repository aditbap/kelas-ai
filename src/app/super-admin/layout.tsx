import type { ReactNode } from 'react';

import { AppShell, type NavItem } from '@/components/app-shell';
import { Role } from '@/generated/prisma/client/enums';
import { requireRole } from '@/lib/session';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/super-admin' },
  { label: 'Tenants', enabled: false },
  { label: 'Billing Oversight', enabled: false },
  { label: 'Instructor Assignments', enabled: false },
  { label: 'Global Content', enabled: false },
];

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireRole(Role.SuperAdmin);

  return (
    <AppShell session={session} roleLabel="Super Admin" navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
