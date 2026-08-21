import { randomUUID } from 'crypto';

import { hashPassword } from 'better-auth/crypto';

import { Role } from '@/generated/prisma/client/enums';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const CREDENTIAL_ISSUER = 'local:credential';

type UserAccountClient = Pick<typeof prisma, 'user' | 'account'>;

/**
 * Creates a User plus the credential Account better-auth authenticates against,
 * with no usable password — the invitee sets their own via the set-password
 * link sent by `sendInviteEmail`. Shared by every "someone else creates this
 * account" flow: checkout provisioning (src/lib/provisioning.ts) and employee
 * invites, so the invite mechanics live in exactly one place.
 */
export async function createInvitedUser(
  client: UserAccountClient,
  data: { name: string; email: string; role: Role; tenantId?: string },
) {
  const user = await client.user.create({ data });
  await client.account.create({
    data: {
      userId: user.id,
      providerId: 'credential',
      issuer: CREDENTIAL_ISSUER,
      accountId: user.id,
      password: await hashPassword(randomUUID()),
    },
  });
  return user;
}

export async function sendInviteEmail(email: string) {
  await auth.api.requestPasswordReset({
    body: { email, redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password` },
  });
}
