import type Stripe from 'stripe';

import { Role, TenantStatus } from '@/generated/prisma/client/enums';
import { createInvitedUser, sendInviteEmail } from '@/lib/invite';
import { prisma } from '@/lib/db';
import { getPricingTier } from '@/lib/pricing';

/**
 * Runs once per successful Stripe Checkout session (PRD §5.1). Creates the
 * Tenant, Subscription, and the CompanyAdmin User/Account, then sends a
 * set-password ("accept invite") link the same way admin-invited employees get one.
 */
export async function provisionTenantFromCheckoutSession(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email;
  const name = session.customer_details?.name ?? email;
  const tierId = session.metadata?.tier;
  const tier = tierId ? getPricingTier(tierId) : undefined;

  if (!email || !tier) {
    throw new Error(`Checkout session ${session.id} is missing email or a known tier.`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Already provisioned (e.g. a retried webhook delivery) — nothing more to do.
    return existing;
  }

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

  const user = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: name ?? email, status: TenantStatus.Active },
    });

    await tx.subscription.create({
      data: {
        tenantId: tenant.id,
        stripeSubscriptionId: subscriptionId,
        tier: tier.name,
        seatLimit: tier.seatLimit,
      },
    });

    return createInvitedUser(tx, {
      name: name ?? email,
      email,
      role: Role.CompanyAdmin,
      tenantId: tenant.id,
    });
  });

  await sendInviteEmail(user.email);

  return user;
}
