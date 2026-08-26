import type { Payment } from '@/generated/prisma/client/client';
import { Prisma } from '@/generated/prisma/client/client';
import { logAudit } from '@/lib/audit';
import { parseAccessExternalId } from '@/lib/checkout-external-id';
import { prisma } from '@/lib/db';
import { PermanentWebhookError } from '@/lib/xendit';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

interface PaidXenditInvoice {
  id: string;
  externalId: string;
  amount: number;
}

/**
 * The single source of truth for "does this Student hold All-Access" -
 * every other function in this module (and every page/action that gates on
 * payment status) goes through this rather than querying Payment directly,
 * so the Paid-status check can never drift out of sync between call sites.
 */
export async function getAllAccessPayment(userId: string): Promise<Payment | null> {
  const payment = await prisma.payment.findUnique({ where: { studentId: userId } });
  return payment?.status === 'Paid' ? payment : null;
}

/** Whether a Student has ever bought the All-Access package. */
export async function hasAllAccess(userId: string): Promise<boolean> {
  return (await getAllAccessPayment(userId)) !== null;
}

/** Batch form of {@link hasAllAccess}, for rendering a roster/list without an N+1 query per row. */
export async function getAllAccessStudentIds(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const payments = await prisma.payment.findMany({
    where: { studentId: { in: userIds }, status: 'Paid' },
    select: { studentId: true },
  });
  return new Set(payments.map((payment) => payment.studentId));
}

/**
 * Runs once per paid All-Access Xendit Invoice. Records the Payment -
 * idempotent against Xendit's webhook redelivery via the unique constraint on
 * xenditInvoiceId, and against a student somehow already holding access via
 * the unique constraint on studentId.
 */
export async function grantAllAccessFromXenditInvoice(invoice: PaidXenditInvoice) {
  const parsed = parseAccessExternalId(invoice.externalId);
  if (!parsed) {
    throw new PermanentWebhookError(
      `Invoice ${invoice.id} (externalId ${invoice.externalId}) is missing a student.`,
    );
  }
  const { studentId } = parsed;

  try {
    await prisma.payment.create({
      data: { studentId, amount: invoice.amount, status: 'Paid', xenditInvoiceId: invoice.id },
    });
  } catch (error) {
    // A redelivered callback for an invoice we already applied (or a second
    // invoice for a student who already has access) hits a unique
    // constraint - that's expected, not a failure, so don't grant twice.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_VIOLATION
    ) {
      return;
    }
    throw error;
  }

  await logAudit({
    actorId: studentId,
    action: 'access.grant.paid',
    targetType: 'Payment',
    targetId: studentId,
  });
}

/**
 * Runs synchronously from the checkout API when a promo code discounts the
 * All-Access package to zero - there's no Xendit invoice to wait on, so
 * access is granted directly instead of through the webhook. Idempotent for
 * the same reason as the paid path: a double-submit hits the unique
 * (studentId) constraint on Payment rather than granting access twice.
 */
export async function grantAllAccessWithPromoCode(params: {
  studentId: string;
  promoCode: string;
}) {
  const { studentId, promoCode } = params;

  try {
    await prisma.payment.create({
      data: { studentId, amount: 0, status: 'Paid', promoCode },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_VIOLATION
    ) {
      return;
    }
    throw error;
  }

  await logAudit({
    actorId: studentId,
    action: 'access.grant.promo',
    targetType: 'Payment',
    targetId: studentId,
  });
}
