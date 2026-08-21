import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import { ImportForm } from './import-form';
import { InviteForm } from './invite-form';

export default async function RosterPage() {
  const session = await requireRole(Role.CompanyAdmin);

  const employees = await prisma.user.findMany({
    where: { tenantId: session.tenantId, role: Role.Employee },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, emailVerified: true, createdAt: true },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Team Roster</h1>
      <p className="mt-2 text-muted-foreground">
        Invite employees individually or import a list from a CSV file.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <InviteForm />
        <ImportForm />
      </div>

      <div className="mt-10 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Invited</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  No employees yet — invite your first one above.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">{employee.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{employee.email}</td>
                  <td className="px-4 py-2">
                    {employee.emailVerified ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Invited
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {employee.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
