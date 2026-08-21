/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '../../src/generated/prisma/client/client';
import { Role } from '../../src/generated/prisma/client/enums';

export type SessionContext = {
  userId: string;
  role: Role;
  tenantId?: string | null;
  assignedTenantIds?: string[]; // For Instructors
};

/**
 * Creates a tenant-scoped Prisma client extension based on the user's session.
 */
export function getTenantScopedClient(prisma: PrismaClient, session: SessionContext) {
  // SuperAdmins bypass all tenant scoping
  if (session.role === Role.SuperAdmin) {
    return prisma.$extends({});
  }

  // Determine allowed tenant IDs
  let allowedTenantIds: string[] = [];
  if (session.role === Role.Instructor) {
    allowedTenantIds = session.assignedTenantIds || [];
    if (allowedTenantIds.length === 0) {
      // Return a client that essentially blocks access to tenant-scoped data
      allowedTenantIds = ['__UNAUTHORIZED_NO_TENANT__'];
    }
  } else {
    if (!session.tenantId) {
      allowedTenantIds = ['__UNAUTHORIZED_NO_TENANT__'];
    } else {
      allowedTenantIds = [session.tenantId];
    }
  }

  // Helper to enforce tenant condition
  const enforceTenant = (args: any) => {
    return {
      ...args,
      where: {
        ...(args as any)?.where,
        tenantId: { in: allowedTenantIds },
      },
    } as any;
  };

  return prisma.$extends({
    query: {
      user: {
        $allOperations({ operation, args, query }) {
          if (
            operation === 'create' ||
            operation === 'createMany' ||
            operation === 'createManyAndReturn'
          )
            return query(args); // Handled by service logic
          return query(enforceTenant(args));
        },
      },
      cohort: {
        $allOperations({ operation, args, query }) {
          if (
            operation === 'create' ||
            operation === 'createMany' ||
            operation === 'createManyAndReturn'
          )
            return query(args);
          return query(enforceTenant(args));
        },
      },
      subscription: {
        $allOperations({ operation, args, query }) {
          if (
            operation === 'create' ||
            operation === 'createMany' ||
            operation === 'createManyAndReturn'
          )
            return query(args);
          return query(enforceTenant(args));
        },
      },
      payment: {
        $allOperations({ operation, args, query }) {
          if (
            operation === 'create' ||
            operation === 'createMany' ||
            operation === 'createManyAndReturn'
          )
            return query(args);
          return query(enforceTenant(args));
        },
      },
      resourceItem: {
        $allOperations({ operation, args, query }) {
          if (
            operation === 'create' ||
            operation === 'createMany' ||
            operation === 'createManyAndReturn'
          )
            return query(args);
          // ResourceItems can be global OR tenant-specific
          const scopedArgs = {
            ...args,
            where: {
              ...(args as any)?.where,
              OR: [{ isGlobal: true }, { tenantId: { in: allowedTenantIds } }],
            },
          } as any;
          // If the caller already provided an OR, this simplistic merge might override it,
          // but it's sufficient for MVP isolation.
          return query(scopedArgs);
        },
      },
      tenant: {
        $allOperations({ operation, args, query }) {
          if (
            operation === 'create' ||
            operation === 'createMany' ||
            operation === 'createManyAndReturn'
          )
            return query(args);
          // Only allow accessing the tenant(s) they belong to
          const scopedArgs = {
            ...args,
            where: {
              ...(args as any)?.where,
              id: { in: allowedTenantIds },
            },
          } as any;
          return query(scopedArgs);
        },
      },
    },
  });
}
