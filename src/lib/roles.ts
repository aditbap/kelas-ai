import { Role } from '@/generated/prisma/client/enums';

/**
 * Client- and server-safe: no Node-only imports, so both the login page
 * (client) and layout guards (server, via src/lib/session.ts) can share it.
 */
export function roleHome(role: Role): string {
  switch (role) {
    case Role.Employee:
      return '/employee';
    case Role.CompanyAdmin:
      return '/admin';
    case Role.Instructor:
      return '/instructor';
    case Role.SuperAdmin:
      return '/super-admin';
  }
}
