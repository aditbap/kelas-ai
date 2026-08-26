import Xendit from 'xendit-node';

/**
 * An invoice callback missing required data (bad externalId, unknown tier,
 * no payer email) will never succeed no matter how many times Xendit retries
 * - the webhook should acknowledge the event (so Xendit stops retrying)
 * rather than 500 and get retried forever.
 */
export class PermanentWebhookError extends Error {}

let xenditClient: Xendit | undefined;

/** Lazy singleton so a missing key only breaks routes that actually use Xendit. */
export function getXendit(): Xendit {
  if (!process.env.XENDIT_SECRET_KEY) {
    throw new Error('XENDIT_SECRET_KEY is not set.');
  }
  xenditClient ??= new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });
  return xenditClient;
}
