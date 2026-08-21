'use server';

import { revalidatePath } from 'next/cache';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { createInvitedUser, sendInviteEmail } from '@/lib/invite';
import { requireRole } from '@/lib/session';

export type ActionState = { error?: string; success?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function inviteEmployeeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.CompanyAdmin);
  if (!session.tenantId) return { error: 'No workspace found for this account.' };

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();

  if (!name || !EMAIL_RE.test(email)) {
    return { error: 'Enter a valid name and email.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: `${email} is already on a roster.` };
  }

  const user = await createInvitedUser(prisma, {
    name,
    email,
    role: Role.Employee,
    tenantId: session.tenantId,
  });
  await sendInviteEmail(user.email);

  revalidatePath('/admin/roster');
  return { success: `Invited ${email}.` };
}

export async function importEmployeesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.CompanyAdmin);
  if (!session.tenantId) return { error: 'No workspace found for this account.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose a CSV file to import.' };
  }

  const rows = parseCsv(await file.text());

  const seen = new Set<string>();
  const candidates: { name: string; email: string }[] = [];
  for (const [name, email] of rows) {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanName = name?.trim();
    if (!cleanName || !cleanEmail || !EMAIL_RE.test(cleanEmail)) continue;
    if (seen.has(cleanEmail)) continue;
    seen.add(cleanEmail);
    candidates.push({ name: cleanName, email: cleanEmail });
  }

  if (candidates.length === 0) {
    return { error: 'No valid rows found. Expected columns: name,email.' };
  }

  const existingEmails = new Set(
    (
      await prisma.user.findMany({
        where: { email: { in: candidates.map((c) => c.email) } },
        select: { email: true },
      })
    ).map((u) => u.email),
  );

  const toCreate = candidates.filter((c) => !existingEmails.has(c.email));

  for (const candidate of toCreate) {
    const user = await createInvitedUser(prisma, {
      ...candidate,
      role: Role.Employee,
      tenantId: session.tenantId,
    });
    await sendInviteEmail(user.email);
  }

  revalidatePath('/admin/roster');
  return {
    success: `Imported ${toCreate.length} of ${candidates.length} rows (${
      candidates.length - toCreate.length
    } already existed).`,
  };
}

/** Simple comma-split parser — good enough for a plain name,email export, no embedded commas. */
function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));
}
