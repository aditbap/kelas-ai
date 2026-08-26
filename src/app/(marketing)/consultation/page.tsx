import type { Metadata } from 'next';

import { Reveal } from '@/components/reveal';
import { Tile } from '@/components/tile';
import { getTranslations } from '@/lib/i18n/get-locale';

import { ConsultationForm } from './consultation-form';

export const metadata: Metadata = {
  title: 'Book a Consultation: Kelas AI',
};

export default async function ConsultationPage() {
  const { t } = await getTranslations();

  return (
    <Tile surface="canvas" innerClassName="max-w-md">
      <Reveal>
        <h1 className="text-center text-display-md text-ink md:text-display-lg">
          {t.consultation.title}
        </h1>
        <p className="mt-4 text-center text-caption text-ink-muted">{t.consultation.description}</p>
        <div className="mt-10">
          <ConsultationForm t={t.consultation.form} />
        </div>
      </Reveal>
    </Tile>
  );
}
