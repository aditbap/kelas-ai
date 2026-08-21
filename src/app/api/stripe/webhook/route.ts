import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { prisma } from '@/lib/db';
import { provisionTenantFromCheckoutSession } from '@/lib/provisioning';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await provisionTenantFromCheckoutSession(session);
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.parent?.subscription_details?.subscription;
      if (subscriptionId) {
        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: String(subscriptionId) },
        });
        if (subscription) {
          await prisma.payment.create({
            data: {
              tenantId: subscription.tenantId,
              subscriptionId: subscription.id,
              amount: invoice.amount_paid,
              status: 'Paid',
              stripeInvoiceId: invoice.id,
            },
          });
        }
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const stripeSubscription = event.data.object as Stripe.Subscription;
      const status = mapStripeStatus(stripeSubscription.status);
      const renewalDate = stripeSubscription.items.data[0]?.current_period_end
        ? new Date(stripeSubscription.items.data[0].current_period_end * 1000)
        : undefined;

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: stripeSubscription.id },
        data: { status, renewalDate },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): 'Active' | 'PastDue' | 'Canceled' | 'Incomplete' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'Active';
    case 'past_due':
    case 'unpaid':
      return 'PastDue';
    case 'canceled':
    case 'incomplete_expired':
      return 'Canceled';
    default:
      return 'Incomplete';
  }
}
