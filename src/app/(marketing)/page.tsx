import Link from 'next/link';

import { Button } from '@/components/ui/button';

const bundle = [
  {
    title: 'Onsite Training',
    description: 'A human instructor delivers hands-on AI training face-to-face at your office.',
  },
  {
    title: 'Digital Companion',
    description: 'Employees revisit material, complete assignments, and track progress online.',
  },
  {
    title: 'AI Resource Library',
    description:
      'Prompting templates, tips, and guides that keep the habit going after training ends.',
  },
  {
    title: 'Adoption Reporting',
    description: 'Your team sees exactly how much the training is actually changing daily work.',
  },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          From AI Awareness to AI Adoption
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
          Turn AI from a buzzword into a daily productivity tool for your employees — onsite
          training backed by a digital platform that makes it stick.
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

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            One bundle, four parts
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bundle.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-background p-6">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
