import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

/**
 * Self-serve sign-up is enabled - anyone can create a Student account. Editor
 * accounts are never self-registered (there's no admin/invite layer left to
 * grant that role); they're created directly in the database (see
 * `prisma/seed.ts`). `role` is `input: false` so a signup request can't set
 * it, and the `databaseHooks.user.create.before` hook below forces it to
 * `Student` server-side as a second, defense-in-depth guarantee.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Never let an email-provider hiccup surface as a 500 on the
      // reset-password flow - the client already shows a generic "check your
      // email" message regardless of whether the address exists, so a send
      // failure here should fail the same way, not blow up the request.
      try {
        await sendEmail({
          to: user.email,
          subject: 'Reset your Kelas AI password',
          html: `<p>Click the link below to reset your password.</p><p><a href="${url}">${url}</a></p>`,
        });
      } catch (error) {
        console.error(`Failed to send reset-password email to ${user.email}:`, error);
      }
    },
  },
  user: {
    additionalFields: {
      role: {
        type: [Role.Student, Role.Editor],
        required: false,
        input: false,
        defaultValue: Role.Student,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({ data: { ...user, role: Role.Student } }),
      },
    },
  },
  plugins: [nextCookies()],
});
