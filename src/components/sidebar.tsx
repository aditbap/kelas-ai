'use client';

import { useState } from 'react';

import { SidebarSimple } from '@phosphor-icons/react';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Menu } from '@base-ui/react/menu';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { AppNav } from '@/components/app-nav';
import { Button } from '@/components/ui/button';
import { ProfileSettingsDialog } from '@/components/profile-settings-dialog';
import { useSidebar } from '@/components/sidebar-context';
import { authClient } from '@/lib/auth-client';
import { useLocale } from '@/lib/i18n/locale-context';
import type { AppRole } from '@/lib/roles';
import type { AppSession } from '@/lib/session';
import { cn } from '@/lib/utils';

/*
  One drawer serves both breakpoints: on mobile it is an off-canvas overlay
  toggled by the header hamburger, on desktop it sits in normal flow and can
  collapse to an icon-only rail. The collapsed width is persisted so it
  survives a reload.
*/
export function Sidebar({
  role,
  session,
  hasAllAccess,
}: {
  role: AppRole;
  session: AppSession;
  /** Student-only: whether they've bought the All-Access package. Omitted for editors. */
  hasAllAccess?: boolean;
}) {
  const { isMobileOpen, closeMobile, isCollapsed, toggleCollapsed } = useSidebar();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const { t } = useLocale();

  function handleSignOut() {
    startTransition(async () => {
      await authClient.signOut();
      router.push('/login');
      router.refresh();
    });
  }

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          aria-label={t.app.sidebar.closeMenu}
          onClick={closeMobile}
          className="fixed inset-x-0 top-12 bottom-0 z-30 bg-void/40 md:hidden"
        />
      ) : null}

      <aside
        className={cn(
          'fixed top-12 bottom-0 left-0 z-40 flex w-72 shrink-0 -translate-x-full flex-col gap-5 overflow-y-auto border-r border-hairline bg-parchment p-4 transition-transform duration-200 ease-out print:hidden',
          'md:sticky md:top-12 md:h-[calc(100dvh-3rem)] md:w-64 md:translate-x-0',
          isMobileOpen && 'translate-x-0',
          isCollapsed && 'md:w-[68px] md:items-center md:px-2.5',
        )}
      >
        <div className="flex items-start justify-between border-b border-hairline pb-4">
          <Menu.Root>
            <Menu.Trigger
              className={cn(
                'flex items-center gap-3 min-w-0 flex-1 text-left outline-none rounded-lg p-1 -ml-1 transition-colors hover:bg-parchment focus-visible:bg-parchment',
                isCollapsed && 'md:hidden',
              )}
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-action/10 flex items-center justify-center text-action font-semibold text-sm">
                {session.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-caption font-medium text-ink truncate">{session.name}</p>
                <p className="mt-0.5 truncate text-fine text-ink-muted">{session.email}</p>
              </div>
            </Menu.Trigger>

            <Menu.Portal>
              <Menu.Positioner align="start" side="bottom" sideOffset={4} className="z-50">
                <Menu.Popup className="w-56 rounded-xl border border-hairline bg-elevated p-1.5 shadow-product outline-none">
                  <Menu.Item
                    onClick={() => setIsProfileSettingsOpen(true)}
                    className="flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-sm text-ink outline-none hover:bg-parchment focus:bg-parchment"
                  >
                    {t.app.sidebar.profile}
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="mt-1 flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-sm text-destructive outline-none hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    {t.app.sidebar.logout}
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? t.app.sidebar.expandSidebar : t.app.sidebar.collapseSidebar}
            aria-pressed={isCollapsed}
            className={cn(
              'hidden shrink-0 rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-elevated hover:text-ink md:flex md:items-center',
              isCollapsed ? 'w-full justify-center' : '',
            )}
          >
            <SidebarSimple size={17} weight={isCollapsed ? 'fill' : 'regular'} />
          </button>
        </div>

        <AppNav role={role} collapsed={isCollapsed} hasAllAccess={hasAllAccess} />
      </aside>

      <ProfileSettingsDialog
        open={isProfileSettingsOpen}
        onOpenChange={setIsProfileSettingsOpen}
        session={session}
      />

      <AlertDialog.Root open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-void/50 backdrop-blur-sm transition-all duration-300" />
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-canvas p-6 shadow-product outline-none animate-in fade-in zoom-in-95 duration-200">
            <AlertDialog.Title className="text-lg font-semibold text-ink">
              {t.app.sidebar.logoutConfirmTitle}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1 text-sm text-ink-muted">
              {t.app.sidebar.logoutConfirmDescription}
            </AlertDialog.Description>

            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Close
                render={
                  <Button variant="outline" size="sm">
                    {t.app.sidebar.logoutConfirmCancel}
                  </Button>
                }
              />
              <Button size="sm" variant="destructive" disabled={isPending} onClick={handleSignOut}>
                {isPending ? t.app.sidebar.signingOut : t.app.sidebar.logoutConfirmAction}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
