import Stripe from 'stripe';

let stripeClient: Stripe | undefined;

/** Lazy singleton so a missing key only breaks routes that actually use Stripe. */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set.');
  }
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}
