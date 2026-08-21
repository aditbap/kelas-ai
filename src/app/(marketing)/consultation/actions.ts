'use server';

import { sendEmail } from '@/lib/email';

export type ActionState = { error?: string; success?: string };

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
    html: `<p><strong>${name}</strong> (${email}) from <strong>${company}</strong> requested a consultation.</p><p>Approximate seats: ${seats || 'not specified'}</p>`,
  });

  return { success: 'Thanks — someone from our team will reach out within 1 business day.' };
}
