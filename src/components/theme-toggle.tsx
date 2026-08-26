'use client';

import { Moon, Sun } from '@phosphor-icons/react/dist/ssr';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-parchment hover:text-ink"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 scale-100 dark:scale-0" weight="bold" />
      <Moon className="absolute h-4 w-4 scale-0 dark:scale-100" weight="bold" />
    </button>
  );
}
