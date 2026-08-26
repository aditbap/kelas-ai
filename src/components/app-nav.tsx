'use client';

import {
  BookOpen,
  ChartLine,
  ClipboardText,
  Files,
  Gear,
  House,
  type Icon,
  Lightbulb,
  LockKeyOpen,
  UsersThree,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  { href: '/student/progress', labelKey: 'myProgress', icon: ChartLine },
  { href: '/student/resources', labelKey: 'resourceLibrary', icon: Lightbulb },
  { href: '/student/checkout', labelKey: 'getAllAccess', icon: LockKeyOpen },
];

const NAV = { editor: editorNav, student: studentNav };

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
  // Both role dictionaries share the `dashboard` / `resourceLibrary` keys and are
  // otherwise disjoint, so looking a role-specific labelKey up in either is safe.
  const navLabels = t.app.nav[role] as Record<string, string>;

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
