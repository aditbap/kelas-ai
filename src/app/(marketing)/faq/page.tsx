import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Kelas AI',
};

const faqs = [
  {
    question: 'Is this a replacement for the onsite training?',
    answer:
      'No. The platform is a companion to the onsite session, not a replacement for it. The core training is still delivered in person by an instructor.',
  },
  {
    question: 'Can employees use the platform without attending the onsite session?',
    answer:
      'Platform access is tied to a cohort with a scheduled onsite session — it is not sold as a standalone self-serve course.',
  },
  {
    question: 'How is pricing structured?',
    answer:
      'Packages are priced per employee seat per program, billed as a subscription. See the Pricing page for seat-banded tiers, or book a consultation for custom rollouts.',
  },
  {
    question: 'Can we bring our own curriculum?',
    answer:
      'Yes — for Growth and Enterprise packages, your assigned instructor can adapt the curriculum to your team and role mix.',
  },
  {
    question: 'What happens after our subscription ends?',
    answer:
      'Employee access to the platform pauses when the subscription lapses. Renewing restores access to prior progress and materials.',
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">FAQ</h1>

      <dl className="mt-16 space-y-8">
        {faqs.map((faq) => (
          <div key={faq.question} className="border-b border-border pb-8">
            <dt className="text-base font-semibold">{faq.question}</dt>
            <dd className="mt-2 text-sm text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
