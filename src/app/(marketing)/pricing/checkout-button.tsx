'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { PricingTier } from '@/lib/pricing';

export function CheckoutButton({ tier }: { tier: PricingTier }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setIsPending(true);

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: tier.id }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.');
      setIsPending(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div>
      <Button
        className="w-full justify-center"
        variant={tier.highlighted ? 'default' : 'outline'}
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? 'Redirecting…' : 'Get Started'}
      </Button>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
