import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Testimonials — Kelas AI',
};

export default function TestimonialsPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Testimonials</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        We&apos;re onboarding our first cohorts now — client stories and logos will appear here as
        companies complete their onsite training.
      </p>
      <div className="mt-8">
        <Button size="lg" render={<Link href="/consultation">Be an early customer</Link>} />
      </div>
    </section>
  );
}
