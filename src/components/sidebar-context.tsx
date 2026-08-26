'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, type ReactNode } from 'react';

import type { PlayerItem } from '@/app/student/modules/[id]/data';

export type CourseOutlineData = {
  moduleId: string;
  moduleTitle: string;
  overallPercent: number;
  overallProgressLabel: string;
  sessions: { id: string; order: number; title: string }[];
  items: PlayerItem[];
  currentItemId: string;
};

type SidebarContextValue = {
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  courseOutline: CourseOutlineData | null;
  setCourseOutline: (data: CourseOutlineData | null) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [courseOutline, setCourseOutline] = useState<CourseOutlineData | null>(null);
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
        courseOutline,
        setCourseOutline,
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
