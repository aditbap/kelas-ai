import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export default async function SuperAdminDashboardPage() {
  await requireRole(Role.SuperAdmin);

  const tenants = await prisma.tenant.findMany({
    include: {
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
      users: { select: { role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const activeTenants = tenants.filter((tenant) => tenant.status === 'Active').length;
  const totalUsers = tenants.reduce((sum, tenant) => sum + tenant.users.length, 0);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform operations dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          {tenants.length} tenant{tenants.length === 1 ? '' : 's'} · {activeTenants} active ·{' '}
          {totalUsers} total users
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Tenant</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Plan</th>
              <th className="px-4 py-2 font-medium">Seats</th>
              <th className="px-4 py-2 font-medium">Users</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  No tenants provisioned yet.
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => {
                const subscription = tenant.subscriptions[0];
                return (
                  <tr key={tenant.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-medium">{tenant.name}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          tenant.status === 'Active'
                            ? 'rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
                            : 'rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive'
                        }
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{subscription?.tier ?? '—'}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {subscription ? `${subscription.seatsUsed}/${subscription.seatLimit}` : '—'}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{tenant.users.length}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {tenant.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
