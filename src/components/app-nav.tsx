'use client';

import {
  ArrowLeft,
  BookOpen,
  ChartLine,
  ClipboardText,
  Files,
  Gear,
  House,
  type Icon,
  Info,
  Lightbulb,
  LockKeyOpen,
  Trophy,
  UsersThree,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CourseOutlinePanel } from '@/app/student/modules/[id]/course-outline';
import { useSidebar } from '@/components/sidebar-context';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useLocale } from '@/lib/i18n/locale-context';
import type { AppRole } from '@/lib/roles';
import { cn } from '@/lib/utils';

/*
  Nav config lives in this client leaf so the icon components never cross the
  server boundary, and so the active state can read the pathname directly.
  `labelKey` looks up the translated label by name rather than by position,
  so reordering the dictionary can never desync a label from its route.
*/
const editorNav: {
  href: string;
  labelKey: keyof Dictionary['app']['nav']['editor'];
  icon: Icon;
}[] = [
  { href: '/editor', labelKey: 'dashboard', icon: House },
  { href: '/editor/modules', labelKey: 'contentLibrary', icon: Files },
  { href: '/editor/cohorts', labelKey: 'cohorts', icon: UsersThree },
  { href: '/editor/grading', labelKey: 'gradingQueue', icon: ClipboardText },
  { href: '/editor/resources', labelKey: 'resourceLibrary', icon: Lightbulb },
];

const studentNav: {
  href: string;
  labelKey: keyof Dictionary['app']['nav']['student'];
  icon: Icon;
}[] = [
  { href: '/student', labelKey: 'dashboard', icon: House },
  { href: '/student/modules', labelKey: 'learningModules', icon: BookOpen },
  { href: '/student/assignments', labelKey: 'assignments', icon: ClipboardText },
  { href: '/student/progress', labelKey: 'myProgress', icon: Trophy },
  { href: '/student/resources', labelKey: 'resourceLibrary', icon: Lightbulb },
  { href: '/student/checkout', labelKey: 'getAllAccess', icon: LockKeyOpen },
];

const NAV = { editor: editorNav, student: studentNav };

// Items with no dedicated feature yet render disabled rather than dead links.
const courseNav = (
  moduleId: string,
): {
  href: string | null;
  labelKey: keyof Dictionary['app']['nav']['course'];
  icon: Icon;
}[] => [
  { href: `/student/modules/${moduleId}`, labelKey: 'courseMaterial', icon: BookOpen },
  { href: `/student/modules/${moduleId}/grades`, labelKey: 'grades', icon: ChartLine },
  { href: `/student/modules/${moduleId}/info`, labelKey: 'courseInfo', icon: Info },
];

export function AppNav({
  role,
  collapsed = false,
  hasAllAccess,
}: {
  role: AppRole;
  collapsed?: boolean;
  /** Student-only: whether they've bought the All-Access package. Swaps the checkout nav item's label. */
  hasAllAccess?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useLocale();
  const { courseOutline } = useSidebar();
  // Both role dictionaries share the `dashboard` / `resourceLibrary` keys and are
  // otherwise disjoint, so looking a role-specific labelKey up in either is safe.
  const navLabels = t.app.nav[role] as Record<string, string>;

  // Inside a module's player (/student/modules/{id}[/{itemId}]), swap the global
  // nav for a course-scoped one, mirroring how Coursera replaces its sidebar
  // once you're inside a course.
  const moduleMatch = role === 'student' ? pathname.match(/^\/student\/modules\/([^/]+)/) : null;
  const moduleId = moduleMatch?.[1];

  if (moduleId) {
    const courseLabels = t.app.nav.course;
    return (
      <nav aria-label="Primary" className="flex w-full flex-col gap-1">
        <Link
          href="/student"
          className={cn(
            'mb-2 flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-caption text-ink-muted whitespace-nowrap transition-colors hover:bg-elevated/60 hover:text-ink',
            collapsed && 'md:justify-center md:px-2',
          )}
        >
          <ArrowLeft size={17} className="shrink-0" />
          <span className={cn(collapsed && 'md:hidden')}>{courseLabels.backToDashboard}</span>
        </Link>
        {(() => {
          const items = courseNav(moduleId);
          // Longest matching href wins so "Course Material" (a prefix of "Grades"
          // and "Course Info") doesn't light up on those sibling pages too.
          const activeHref = items
            .map((item) => item.href)
            .filter((href): href is string => href != null)
            .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
            .sort((a, b) => b.length - a.length)[0];

          return items.map((item) => {
            const isActive = item.href != null && item.href === activeHref;
            const label = courseLabels[item.labelKey];
            const Icon = item.icon;
            const className = cn(
              'flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-caption whitespace-nowrap transition-colors',
              collapsed && 'md:justify-center md:px-2',
              item.href == null && 'cursor-not-allowed text-ink-faint',
              item.href != null &&
                (isActive
                  ? 'bg-elevated font-medium text-ink shadow-[0_0_0_1px_var(--hairline)]'
                  : 'text-ink-muted hover:bg-elevated/60 hover:text-ink'),
            );

            if (item.href == null) {
              return (
                <span
                  key={item.labelKey}
                  title={collapsed ? label : undefined}
                  className={className}
                >
                  <Icon size={17} className="shrink-0" />
                  <span className={cn(collapsed && 'md:hidden')}>{label}</span>
                </span>
              );
            }

            return (
              <div key={item.labelKey}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? label : undefined}
                  className={className}
                >
                  <Icon size={17} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
                  <span className={cn(collapsed && 'md:hidden')}>{label}</span>
                </Link>

                {item.labelKey === 'courseMaterial' && courseOutline && !collapsed ? (
                  <div className="mt-2 mb-1 pl-1">
                    <CourseOutlinePanel {...courseOutline} />
                  </div>
                ) : null}
              </div>
            );
          });
        })()}
      </nav>
    );
  }

  return (
    <nav aria-label="Primary" className="flex w-full flex-col gap-1">
      {NAV[role].map((item) => {
        const isCheckoutItem = item.labelKey === 'getAllAccess';
        const label =
          navLabels[isCheckoutItem && hasAllAccess ? 'manageSubscription' : item.labelKey];
        // Exact match for the dashboard root, prefix match for its children.
        const isActive =
          item.href === `/${role}` ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = isCheckoutItem && hasAllAccess ? Gear : item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              'flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-caption whitespace-nowrap transition-colors',
              collapsed && 'md:justify-center md:px-2',
              isActive
                ? 'bg-elevated font-medium text-ink shadow-[0_0_0_1px_var(--hairline)]'
                : 'text-ink-muted hover:bg-elevated/60 hover:text-ink',
            )}
          >
            <Icon size={17} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
            <span className={cn(collapsed && 'md:hidden')}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
