import { NextRequest, NextResponse } from 'next/server';

import { getPricingTier } from '@/lib/pricing';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const { tier: tierId } = await request.json();
  const tier = getPricingTier(tierId);
  if (!tier) {
    return NextResponse.json({ error: 'Unknown pricing tier.' }, { status: 400 });
  }

  const priceId = process.env[tier.priceEnvVar];
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe is not configured for the ${tier.name} tier yet.` },
      { status: 503 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { tier: tier.id },
    subscription_data: { metadata: { tier: tier.id } },
  });

  if (!session.url) {
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
