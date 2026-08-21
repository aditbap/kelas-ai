/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { getTenantScopedClient, SessionContext } from '../authz';
import { PrismaClient } from '../../../src/generated/prisma/client/client';
import { Role } from '../../../src/generated/prisma/client/enums';

// Mock Prisma Client
const mockPrisma = {
  $extends: vi.fn((ext) => ext),
} as unknown as PrismaClient;

describe('Authorization Layer (Tenant Isolation)', () => {
  it('SuperAdmin bypasses scoping', () => {
    const session: SessionContext = { userId: '1', role: Role.SuperAdmin };
    const client = getTenantScopedClient(mockPrisma, session) as any;
    expect(client.query).toBeUndefined(); // Extends with {}
  });

  it('Employee is scoped to their tenant for Users', () => {
    const session: SessionContext = { userId: '2', role: Role.Employee, tenantId: 'tenant-A' };
    const client = getTenantScopedClient(mockPrisma, session) as any;

    // Simulate a query execution intercepted by the extension
    const queryArgs = { where: { name: 'Alice' } };
    const queryFn = vi.fn();

    client.query.user.$allOperations({ operation: 'findMany', args: queryArgs, query: queryFn });

    expect(queryFn).toHaveBeenCalledWith({
      where: {
        name: 'Alice',
        tenantId: { in: ['tenant-A'] },
      },
    });
  });

  it('Instructor is scoped to assigned tenants for Cohorts', () => {
    const session: SessionContext = {
      userId: '3',
      role: Role.Instructor,
      assignedTenantIds: ['tenant-A', 'tenant-B'],
    };
    const client = getTenantScopedClient(mockPrisma, session) as any;

    const queryFn = vi.fn();
    client.query.cohort.$allOperations({ operation: 'findMany', args: {}, query: queryFn });

    expect(queryFn).toHaveBeenCalledWith({
      where: {
        tenantId: { in: ['tenant-A', 'tenant-B'] },
      },
    });
  });

  it('ResourceItems allow global resources plus tenant-specific ones', () => {
    const session: SessionContext = { userId: '4', role: Role.CompanyAdmin, tenantId: 'tenant-C' };
    const client = getTenantScopedClient(mockPrisma, session) as any;

    const queryFn = vi.fn();
    client.query.resourceItem.$allOperations({ operation: 'findMany', args: {}, query: queryFn });

    expect(queryFn).toHaveBeenCalledWith({
      where: {
        OR: [{ isGlobal: true }, { tenantId: { in: ['tenant-C'] } }],
      },
    });
  });
});
