'use client';

import { List, X } from '@phosphor-icons/react';

import { useSidebar } from '@/components/sidebar-context';

/** Hamburger toggle for the mobile drawer, rendered in the black global bar. */
export function SidebarToggle() {
  const { isMobileOpen, openMobile, closeMobile } = useSidebar();

  return (
    <button
      type="button"
      onClick={isMobileOpen ? closeMobile : openMobile}
      aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isMobileOpen}
      className="-ml-1.5 flex size-8 shrink-0 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-parchment hover:text-ink md:hidden"
    >
      {isMobileOpen ? <X size={19} /> : <List size={19} />}
    </button>
  );
}
