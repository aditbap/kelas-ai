import { NextRequest, NextResponse } from 'next/server';

import { grantAllAccessFromXenditInvoice } from '@/lib/access';
import { isAccessExternalId } from '@/lib/checkout-external-id';
import { PermanentWebhookError } from '@/lib/xendit';

interface XenditInvoiceCallback {
  id: string;
  externalId: string;
  status: string;
  amount: number;
}

export async function POST(request: NextRequest) {
  // Xendit authenticates callbacks with a static shared token in this header
  // (set in the dashboard's callback config), not a signed payload like Stripe.
  const token = request.headers.get('x-callback-token');
  const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;
  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: 'Invalid callback token.' }, { status: 401 });
  }

  const payload = (await request.json()) as XenditInvoiceCallback;

  if (payload.status !== 'PAID') {
    return NextResponse.json({ received: true });
  }

  try {
    if (isAccessExternalId(payload.externalId)) {
      await grantAllAccessFromXenditInvoice(payload);
    }
    // Any other externalId isn't one this app generated - nothing else
    // currently listens for paid invoices.
  } catch (error) {
    if (error instanceof PermanentWebhookError) {
      // Retrying can never fix an invoice that's missing required data - ack
      // it so Xendit stops resending, and leave the error logged for follow-up.
      console.error(`Xendit webhook: permanent failure for invoice ${payload.id}:`, error);
      return NextResponse.json({ received: true, warning: 'Not fully processed.' });
    }

    console.error(`Xendit webhook handler failed for invoice ${payload.id}:`, error);
    // A non-2xx tells Xendit to retry - correct for genuine transient failures
    // (DB blip, a real bug).
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
