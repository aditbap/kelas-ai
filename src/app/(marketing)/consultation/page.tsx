import type { Metadata } from 'next';

import { ConsultationForm } from './consultation-form';

export const metadata: Metadata = {
  title: 'Book a Consultation — Kelas AI',
};

export default function ConsultationPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-center text-3xl font-bold tracking-tight">Book a Consultation</h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        For larger seat counts, custom curriculum, or multi-site rollouts — tell us about your team
        and we&apos;ll follow up.
      </p>
      <div className="mt-10">
        <ConsultationForm />
      </div>
    </section>
  );
}
