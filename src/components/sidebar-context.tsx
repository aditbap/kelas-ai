'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, type ReactNode } from 'react';

type SidebarContextValue = {
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [trackedPathname, setTrackedPathname] = useState(pathname);

  // A drawer left open across a navigation would cover the next page. This
  // resets during render (React's documented pattern for state that depends
  // on a changing prop) instead of an effect, so it lands in the same commit.
  if (pathname !== trackedPathname) {
    setTrackedPathname(pathname);
    setIsMobileOpen(false);
  }

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        openMobile: () => setIsMobileOpen(true),
        closeMobile: () => setIsMobileOpen(false),
        isCollapsed,
        toggleCollapsed: () => setIsCollapsed((prev) => !prev),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider');
  return ctx;
}
