import type { Metadata } from 'next';
import Link from 'next/link';

import { PRICING_TIERS } from '@/lib/pricing';

import { CheckoutButton } from './checkout-button';

export const metadata: Metadata = {
  title: 'Pricing — Kelas AI',
};

export default function PricingPage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Every package bundles onsite training, digital platform access, and the AI Resource
          Library. Priced per employee seat.
        </p>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={
                  tier.highlighted
                    ? 'rounded-xl border-2 border-primary bg-background p-6'
                    : 'rounded-xl border border-border bg-background p-6'
                }
              >
                <h2 className="text-lg font-semibold">{tier.name}</h2>
                <p className="mt-1 text-sm font-medium text-primary">{tier.seatsLabel}</p>
                <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
                <div className="mt-6">
                  <CheckoutButton tier={tier} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need a custom rollout across multiple sites?{' '}
            <Link href="/consultation" className="font-medium text-primary hover:underline">
              Book a consultation
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
