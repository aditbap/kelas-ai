import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Successful — Kelas AI',
};

export default function CheckoutSuccessPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">You&apos;re all set</h1>
      <p className="mt-4 text-muted-foreground">
        Payment received. Check your email for a link to set up your workspace and invite your team.
      </p>
    </section>
  );
}
