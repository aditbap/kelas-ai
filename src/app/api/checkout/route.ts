import { NextRequest, NextResponse } from 'next/server';

import { grantAllAccessWithPromoCode, hasAllAccess } from '@/lib/access';
import { buildAccessExternalId } from '@/lib/checkout-external-id';
import { Role } from '@/generated/prisma/client/enums';
import { ALL_ACCESS_PRICE_IDR } from '@/lib/pricing';
import { applyDiscount, findPromoCode } from '@/lib/promo-codes';
import { getAppSession } from '@/lib/session';
import { getXendit } from '@/lib/xendit';

export async function POST(request: NextRequest) {
  const session = await getAppSession();
  if (!session || session.role !== Role.Student) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  }

  if (await hasAllAccess(session.userId)) {
    return NextResponse.json({ error: 'You already have All-Access.' }, { status: 400 });
  }

  const { promoCode: rawPromoCode } = await request.json();

  // Whatever discount the client displayed was only ever a preview - the
  // code is re-validated here, and this is the only place the charged (or
  // waived) amount is actually decided.
  let promo = null;
  const trimmedPromoCode = String(rawPromoCode ?? '').trim();
  if (trimmedPromoCode) {
    promo = findPromoCode(trimmedPromoCode);
    if (!promo) {
      return NextResponse.json({ error: 'Kode promo tidak valid.' }, { status: 400 });
    }
  }
  const finalAmount = promo
    ? applyDiscount(ALL_ACCESS_PRICE_IDR, promo.discountPercent)
    : ALL_ACCESS_PRICE_IDR;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  if (finalAmount <= 0) {
    // A 100%-off promo has nothing left to pay, so it skips the payment
    // gateway entirely instead of round-tripping through a zero-amount invoice.
    await grantAllAccessWithPromoCode({ studentId: session.userId, promoCode: promo!.code });
    // Distinct from the Xendit success param below: this access grant is
    // already committed, not pending a webhook, so it gets its own message.
    return NextResponse.json({ url: `${appUrl}/student/modules?unlocked=free` });
  }

  // A student is granted access off the first paid Invoice, identified in the
  // webhook by this externalId format.
  const externalId = buildAccessExternalId(session.userId, crypto.randomUUID());

  // The client always does `await response.json()`, including on error - an
  // unhandled throw here would return Next's HTML error page instead of JSON
  // and break that parse, leaving checkout stuck on "Redirecting…".
  let invoice;
  try {
    invoice = await getXendit().Invoice.createInvoice({
      data: {
        externalId,
        amount: finalAmount,
        currency: 'IDR',
        payerEmail: session.email,
        description: promo
          ? `Kelas AI: All-Access package (promo ${promo.code})`
          : 'Kelas AI: All-Access package',
        successRedirectUrl: `${appUrl}/student/modules?unlocked=1`,
        failureRedirectUrl: `${appUrl}/student/checkout`,
      },
    });
  } catch (error) {
    console.error('Failed to create Xendit invoice:', error);
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 502 },
    );
  }

  if (!invoice.invoiceUrl) {
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }

  return NextResponse.json({ url: invoice.invoiceUrl });
}
