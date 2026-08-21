import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import { toggleTenantStatusAction } from './actions';

export default async function TenantsPage() {
  await requireRole(Role.SuperAdmin);

  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
      <p className="mt-2 text-muted-foreground">
        Suspend a tenant to block its users from logging in.
      </p>

      <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
        {tenants.map((tenant) => (
          <li key={tenant.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">{tenant.name}</p>
              <p className="text-xs text-muted-foreground">
                {tenant.status} · created {tenant.createdAt.toLocaleDateString()}
              </p>
            </div>
            <form action={toggleTenantStatusAction}>
              <input type="hidden" name="tenantId" value={tenant.id} />
              <button
                type="submit"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {tenant.status === 'Active' ? 'Suspend' : 'Reactivate'}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
