import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';

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
      // TODO(Phase 4/5): replace with a real transactional email (Resend) once
      // the checkout/invite flows exist. Logging keeps the invite/reset flow
      // testable end-to-end in the meantime.
      console.log(`[auth] Set-password link for ${user.email}: ${url}`);
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
