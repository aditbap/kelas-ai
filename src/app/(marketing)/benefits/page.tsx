import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Benefits — Kelas AI',
};

const companyBenefits = [
  'Visibility into whether training actually changed daily behavior, not just attendance',
  'Adoption reporting your leadership can point to as ROI',
  'One workspace for every onsite cohort — no spreadsheets to track progress',
  'Seats scale with your headcount, no re-negotiating a new deal each time',
];

const employeeBenefits = [
  'Practical AI skills you can use the same day, not abstract theory',
  'A place to revisit training material whenever you need it',
  'Prompting templates and guides for your actual day-to-day tasks',
  'Feedback from a real instructor on your assignments, not just a quiz score',
];

export default function BenefitsPage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Benefits</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          One bundle, two audiences — here&apos;s what each side actually gets.
        </p>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-20 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-8">
            <h2 className="text-xl font-bold tracking-tight">For Companies</h2>
            <ul className="mt-6 space-y-3">
              {companyBenefits.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="text-primary">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-background p-8">
            <h2 className="text-xl font-bold tracking-tight">For Employees</h2>
            <ul className="mt-6 space-y-3">
              {employeeBenefits.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="text-primary">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
