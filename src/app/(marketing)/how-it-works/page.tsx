import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'How It Works — Kelas AI',
};

const steps = [
  {
    step: '01',
    title: 'Onsite training, delivered in person',
    description:
      'A human instructor runs a hands-on AI session at your office — not a pre-recorded course. Your team learns by doing, together.',
  },
  {
    step: '02',
    title: 'The platform picks up where the room leaves off',
    description:
      'After the session, employees get access to the material, guided assignments, and prompting templates — a place to keep practicing, not a new course to enroll in.',
  },
  {
    step: '03',
    title: 'Employees build the habit',
    description:
      'Short assignments and a searchable AI Resource Library turn one training day into a recurring habit of using AI at work.',
  },
  {
    step: '04',
    title: 'You see the adoption, not just attendance',
    description:
      'Your admin dashboard tracks activity after the onsite date — the real signal of whether the training changed daily behavior.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">How It Works</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          The training happens onsite, face-to-face. The platform is the digital companion that
          makes it stick — it&apos;s not a self-serve course you work through alone.
        </p>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <ol className="space-y-10">
            {steps.map((item) => (
              <li key={item.step} className="flex gap-6">
                <span className="shrink-0 text-2xl font-bold text-primary">{item.step}</span>
                <div>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Not another course catalog</h2>
        <p className="mt-4 text-muted-foreground">
          Unlike Coursera or Udemy, content here is anchored to your company&apos;s own onsite
          cohort and instructor — the goal is behavior change, not credentials.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/pricing">See Pricing</Link>} />
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/consultation">Book a Consultation</Link>}
          />
        </div>
      </section>
    </>
  );
}
