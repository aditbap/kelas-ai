import Link from 'next/link';
import type { ReactNode } from 'react';

import { SignOutButton } from '@/components/sign-out-button';
import type { AppSession } from '@/lib/session';
import { cn } from '@/lib/utils';

export type NavItem = {
  label: string;
  href?: string;
  enabled?: boolean;
};

export function AppShell({
  session,
  roleLabel,
  navItems,
  children,
}: {
  session: AppSession;
  roleLabel: string;
  navItems: NavItem[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 border-b border-sidebar-border bg-sidebar p-4 text-sidebar-foreground md:w-64 md:border-r md:border-b-0">
        <div>
          <p className="text-sm font-semibold tracking-tight">Kelas AI</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>

        <nav
          aria-label="Primary"
          className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible"
        >
          {navItems.map((item) => {
            const isLink = item.enabled !== false && item.href;
            const itemClassName = cn(
              'shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap',
              isLink
                ? 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                : 'text-muted-foreground',
            );

            if (isLink) {
              return (
                <Link key={item.label} href={item.href!} className={itemClassName}>
                  {item.label}
                </Link>
              );
            }

            return (
              <span key={item.label} className={cn(itemClassName, 'flex items-center gap-2')}>
                {item.label}
                <span className="rounded-full border border-sidebar-border px-1.5 py-0.5 text-[0.65rem] font-normal text-muted-foreground">
                  Soon
                </span>
              </span>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
          <div className="text-xs">
            <p className="font-medium">{session.name}</p>
            <p className="text-muted-foreground">{session.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
