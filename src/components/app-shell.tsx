import Link from 'next/link';
import type { ReactNode } from 'react';

import { LanguageToggle } from '@/components/language-toggle';
import { Sidebar } from '@/components/sidebar';
import { SidebarProvider } from '@/components/sidebar-context';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { getTranslations } from '@/lib/i18n/get-locale';
import type { AppRole } from '@/lib/roles';
import type { AppSession } from '@/lib/session';

import { ThemeToggle } from '@/components/theme-toggle';

/*
  Same design language as the marketing site, expressed at a denser volume:
  the black global bar carries over for brand continuity, then a parchment
  sidebar and a canvas work area. The tile rhythm deliberately does not apply
  here, since alternating full-bleed bands do not suit dense product UI.

  The sidebar minimizes on both breakpoints: an off-canvas drawer on mobile
  (hidden by default, opened with the header hamburger) and a collapsible
  icon rail on desktop. State lives in SidebarProvider so the header toggle
  and the drawer itself can share it without prop drilling.
*/
export async function AppShell({
  session,
  role,
  hasAllAccess,
  children,
}: {
  session: AppSession;
  role: AppRole;
  /** Student-only: whether they've bought the All-Access package. Omitted for editors. */
  hasAllAccess?: boolean;
  children: ReactNode;
}) {
  const { t } = await getTranslations();

  return (
    <SidebarProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <header className="sticky top-0 z-40 bg-canvas border-b border-hairline text-ink">
          <div className="flex h-12 items-center gap-2.5 px-4 md:px-6">
            <SidebarToggle />
            <div className="flex flex-1 items-baseline gap-2.5">
              <Link href="/" className="text-caption font-semibold tracking-tight text-ink">
                Kelas AI
              </Link>
              <span className="text-fine text-ink-muted">{t.common.roleLabel[role]}</span>
            </div>
            <div className="flex items-center gap-4">
              {hasAllAccess !== undefined ? (
                hasAllAccess ? (
                  <Link
                    href="/student/checkout"
                    className="shrink-0 rounded-full bg-action/10 px-2.5 py-0.5 text-fine font-medium text-action transition-colors hover:bg-action/20"
                  >
                    {t.app.allAccessBadge}
                  </Link>
                ) : (
                  <Link
                    href="/student/checkout"
                    className="shrink-0 rounded-full border border-hairline px-2.5 py-0.5 text-fine font-medium text-ink-muted transition-colors hover:text-ink"
                  >
                    {t.app.noAccessUpgrade}
                  </Link>
                )
              ) : null}
              <LanguageToggle className="text-fine text-ink-muted" />
              <ThemeToggle />
              <p className="truncate text-fine text-ink-muted">{session.email}</p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 md:flex-row">
          <Sidebar role={role} session={session} hasAllAccess={hasAllAccess} />

          <main className="min-w-0 flex-1 bg-canvas p-6 md:p-10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
