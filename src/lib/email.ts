import { Resend } from 'resend';

let resendClient: Resend | undefined;

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes user-supplied text before interpolating it into an HTML email body. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Sends via Resend when configured; otherwise logs, so every email-triggering
 * flow (invites, set-password links, consultation notifications) stays
 * testable end-to-end before a real API key exists - same pattern as
 * getXendit() in src/lib/xendit.ts.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.log(`[email] (not configured) To: ${params.to} - ${params.subject}\n${params.html}`);
    return;
  }

  resendClient ??= new Resend(apiKey);
  await resendClient.emails.send({ from, ...params });
}
