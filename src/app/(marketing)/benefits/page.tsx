import { Check } from '@phosphor-icons/react/dist/ssr';
import type { Metadata } from 'next';

import { Reveal } from '@/components/reveal';
import { Tile } from '@/components/tile';
import { getTranslations } from '@/lib/i18n/get-locale';

export const metadata: Metadata = {
  title: 'Benefits: Kelas AI',
};

function BenefitList({ items, tone }: { items: string[]; tone: 'light' | 'dark' }) {
  return (
    <ul className="mt-8 space-y-4">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check
            size={18}
            weight="bold"
            className={
              tone === 'dark' ? 'mt-1 shrink-0 text-action-on-dark' : 'mt-1 shrink-0 text-action'
            }
          />
          <span
            className={
              tone === 'dark' ? 'text-caption text-on-dark-muted' : 'text-caption text-ink-muted'
            }
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function BenefitsPage() {
  const { t } = await getTranslations();

  return (
    <>
      <Tile surface="canvas" innerClassName="max-w-3xl text-center">
        <Reveal>
          <h1 className="text-display-lg text-ink md:text-hero">{t.benefits.title}</h1>
          <p className="mx-auto mt-5 max-w-[44ch] text-lead-airy text-ink-muted">
            {t.benefits.subtitle}
          </p>
        </Reveal>
      </Tile>

      {/* The surface change between these two tiles is what separates the audiences. */}
      <Tile surface="parchment" innerClassName="max-w-3xl">
        <Reveal>
          <h2 className="text-display-md text-ink md:text-display-lg">
            {t.benefits.companies.heading}
          </h2>
          <BenefitList items={t.benefits.companies.items} tone="light" />
        </Reveal>
      </Tile>

      <Tile surface="dark" innerClassName="max-w-3xl">
        <Reveal>
          <h2 className="text-display-md text-on-dark md:text-display-lg">
            {t.benefits.employees.heading}
          </h2>
          <BenefitList items={t.benefits.employees.items} tone="dark" />
        </Reveal>
      </Tile>
    </>
  );
}
