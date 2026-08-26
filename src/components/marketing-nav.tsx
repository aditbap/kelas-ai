'use client';

import { List, X } from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';

import { LanguageToggle } from '@/components/language-toggle';
import { useLocale } from '@/lib/i18n/locale-context';

/*
  The near-invisible black global nav. It is the one place true black appears,
  and it recedes so the page content carries the page. Single row at 48px:
  Apple stacks a second frosted sub-nav, but 44 + 52 would put the combined
  chrome near 100px, so this collapses that into one bar.
*/
export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  // Every entry lives as a section on the home page, so the nav always
  // scrolls there rather than navigating to a standalone route.
  const links = [
    { href: '/#programs', label: t.nav.programs },
    { href: '/#how-it-works', label: t.nav.howItWorks },
    { href: '/#pricing', label: t.nav.pricing },
    { href: '/#faq', label: t.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-40 bg-void text-white">
      <nav aria-label="Primary" className="mx-auto max-w-6xl px-6">
        <div className="relative flex h-12 items-center justify-between">
          <div className="flex flex-1 items-center">
            <Link
              href="/"
              className="text-caption font-semibold tracking-tight text-white"
              onClick={() => setOpen(false)}
            >
              Kelas AI
            </Link>
          </div>

          <ul className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-8 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-fine text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden flex-1 items-center justify-end gap-5 md:flex">
            <LanguageToggle className="text-white/80" />
            <Link
              href="/login"
              className="text-fine text-white/80 transition-colors hover:text-white"
            >
              {t.common.logIn}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-action px-4 py-1.5 text-fine font-medium text-white transition-transform active:scale-[0.95]"
            >
              {t.common.signUp}
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
            className="-mr-2 flex size-11 items-center justify-center text-white md:hidden"
          >
            {open ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
          </button>
        </div>

        {open ? (
          <ul id="mobile-nav" className="border-t border-white/10 py-2 md:hidden">
            {[...links, { href: '/login', label: t.common.logIn }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-body text-white/80"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center justify-between gap-4 pt-2 pb-3">
              <LanguageToggle className="text-white/80" />
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex h-11 flex-1 items-center justify-center rounded-full bg-action text-body font-medium text-white"
              >
                {t.common.signUp}
              </Link>
            </li>
          </ul>
        ) : null}
      </nav>
    </header>
  );
}
