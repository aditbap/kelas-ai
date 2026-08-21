import Link from 'next/link';

import { Button } from '@/components/ui/button';

const links = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/programs', label: 'Programs' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Kelas AI
        </Link>

        <nav aria-label="Primary" className="hidden gap-8 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/login">Log In</Link>} />
          <Button size="sm" render={<Link href="/consultation">Book a Consultation</Link>} />
        </div>
      </div>
    </header>
  );
}
