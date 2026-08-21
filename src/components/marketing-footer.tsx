import Link from 'next/link';

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/programs', label: 'Programs' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/faq', label: 'FAQ' },
      { href: '/consultation', label: 'Book a Consultation' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div>
            <p className="text-lg font-bold tracking-tight">Kelas AI</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              From AI Awareness to AI Adoption.
            </p>
          </div>

          <div className="flex gap-16">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-semibold">{column.title}</p>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kelas AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
