import Link from 'next/link';

import { getTranslations } from '@/lib/i18n/get-locale';

/*
  The footer is the one place the design goes deliberately dense: relaxed
  link leading (the documented 2.41) is what keeps the packed columns scannable.
*/
export async function MarketingFooter() {
  const { t } = await getTranslations();

  const columns = [
    {
      title: t.footer.columnProgram,
      links: [
        { href: '/#how-it-works', label: t.nav.howItWorks },
        { href: '/#programs', label: t.nav.programs },
        { href: '/#pricing', label: t.nav.pricing },
      ],
    },
    {
      title: t.footer.columnCompany,
      links: [
        { href: '/benefits', label: t.footer.benefits },
        { href: '/testimonials', label: t.footer.testimonials },
        { href: '/#faq', label: t.nav.faq },
      ],
    },
    {
      title: t.footer.columnAccount,
      links: [
        { href: '/login', label: t.common.logIn },
        { href: '/signup', label: t.common.signUp },
        { href: '/consultation', label: t.common.bookConsultation },
      ],
    },
  ];

  return (
    <footer className="bg-parchment">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-tagline font-display text-ink">Kelas AI</p>
            <p className="mt-2 max-w-[28ch] text-caption text-ink-muted">{t.footer.tagline}</p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-caption font-semibold text-ink">{column.title}</h2>
              <ul className="mt-2 leading-[2.41]">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-caption text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-hairline pt-6 text-fine text-ink-muted">
          {t.footer.copyright.replace('{year}', String(new Date().getFullYear()))}
        </p>
      </div>
    </footer>
  );
}
