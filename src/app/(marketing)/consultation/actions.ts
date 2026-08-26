'use server';

import { escapeHtml, sendEmail } from '@/lib/email';

import type { ActionState } from '@/lib/actions';
export type { ActionState };

export async function submitConsultationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get('name') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const seats = String(formData.get('seats') ?? '').trim();

  if (!name || !company || !email) {
    return { error: 'Please fill in your name, company, and email.' };
  }

  const notifyTo = process.env.CONSULTATION_NOTIFY_EMAIL ?? 'sales@kelas.ai';
  await sendEmail({
    to: notifyTo,
    subject: `New consultation request: ${company}`,
    html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) from <strong>${escapeHtml(company)}</strong> requested a consultation.</p><p>Approximate seats: ${escapeHtml(seats) || 'not specified'}</p>`,
  });

  return { success: 'Thanks. Someone from our team will reach out within 1 business day.' };
}
