import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

/**
 * Accounts on this platform are never publicly self-registered — every User is
 * created server-side by a provisioning flow (checkout, employee invite, instructor
 * onboarding) that assigns `role`/`tenantId` deliberately. Sign-up is disabled so the
 * only way in is: an admin/system creates the User, then the person sets their own
 * password via the reset-password ("accept invite") link.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Set your Kelas AI password',
        html: `<p>Click the link below to set your password and access your workspace.</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: [Role.Employee, Role.CompanyAdmin, Role.Instructor, Role.SuperAdmin],
        required: true,
        input: false,
      },
      tenantId: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});
