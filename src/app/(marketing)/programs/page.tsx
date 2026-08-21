import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Programs & Curriculum — Kelas AI',
};

const modules = [
  {
    title: 'AI Fundamentals',
    description: "What LLMs can and can't do, common pitfalls, and how to evaluate AI output.",
  },
  {
    title: 'Prompting for Daily Work',
    description: 'Writing, summarizing, and analyzing with AI — practical prompts for real tasks.',
  },
  {
    title: 'AI in Your Role',
    description:
      'Role-specific playbooks (ops, marketing, engineering, support) built with your team.',
  },
  {
    title: 'Responsible & Safe Use',
    description: 'Data privacy, accuracy checks, and company policy for using AI tools at work.',
  },
];

export default function ProgramsPage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Programs & Curriculum</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Every engagement starts with a shared foundation, then adapts to how your teams actually
          work.
        </p>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            {modules.map((module) => (
              <div key={module.title} className="rounded-xl border border-border bg-background p-6">
                <h2 className="text-base font-semibold">{module.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Curriculum is instructor-led</h2>
        <p className="mt-4 text-muted-foreground">
          Modules are authored and adapted by your assigned instructor for your team&apos;s cohort —
          this isn&apos;t a fixed course catalog.
        </p>
        <div className="mt-8">
          <Button size="lg" render={<Link href="/pricing">See Pricing</Link>} />
        </div>
      </section>
    </>
  );
}
