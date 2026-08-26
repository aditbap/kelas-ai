import { Role } from '@/generated/prisma/client/enums';

/**
 * Client- and server-safe: no Node-only imports, so both the login page
 * (client) and layout guards (server, via src/lib/session.ts) can share it.
 */
export function roleHome(role: Role): string {
  switch (role) {
    case Role.Student:
      return '/student';
    case Role.Editor:
      return '/editor';
  }
}

/** Lowercase route segment used to key the dashboard nav. */
export type AppRole = 'editor' | 'student';
