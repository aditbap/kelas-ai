import type { Metadata } from 'next';
import Link from 'next/link';

import { Reveal } from '@/components/reveal';
import { Tile } from '@/components/tile';
import { Button } from '@/components/ui/button';
import { getTranslations } from '@/lib/i18n/get-locale';

export const metadata: Metadata = {
  title: 'Testimonials: Kelas AI',
};

/*
  Deliberately empty of quotes. The business is onboarding its first cohorts,
  so this page says so plainly rather than showing invented client stories.
  The CTA label matches the contact CTA used everywhere else on the site.
*/
export default async function TestimonialsPage() {
  const { t } = await getTranslations();

  return (
    <Tile surface="canvas" innerClassName="max-w-2xl text-center">
      <Reveal>
        <h1 className="text-display-lg text-ink md:text-hero">{t.testimonials.title}</h1>
        <p className="mt-5 text-lead-airy text-ink-muted">{t.testimonials.description}</p>
        <div className="mt-8">
          <Button render={<Link href="/consultation">{t.common.bookConsultation}</Link>} />
        </div>
      </Reveal>
    </Tile>
  );
}
