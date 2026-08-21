import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

const AT_RISK_DAYS = 14;

export default async function CompanyAdminDashboardPage() {
  const session = await requireRole(Role.CompanyAdmin);

  const employees = await prisma.user.findMany({
    where: { tenantId: session.tenantId, role: Role.Employee },
    select: { id: true, name: true, email: true },
  });

  const progressRecords = await prisma.progressRecord.findMany({
    where: { userId: { in: employees.map((employee) => employee.id) } },
  });

  const byUser = new Map<string, typeof progressRecords>();
  for (const record of progressRecords) {
    byUser.set(record.userId, [...(byUser.get(record.userId) ?? []), record]);
  }

  const atRiskCutoff = new Date().getTime() - AT_RISK_DAYS * 24 * 60 * 60 * 1000;

  const rows = employees.map((employee) => {
    const records = byUser.get(employee.id) ?? [];
    const completed = records.filter((record) => record.assignmentStatus === 'Graded').length;
    const lastActivityAt = records.reduce<Date | null>(
      (latest, record) =>
        !latest || record.lastActivityAt > latest ? record.lastActivityAt : latest,
      null,
    );
    const atRisk = !lastActivityAt || lastActivityAt.getTime() < atRiskCutoff;

    return { employee, completed, total: records.length, lastActivityAt, atRisk };
  });

  const overallCompletion =
    progressRecords.length === 0
      ? 0
      : Math.round(
          (progressRecords.filter((record) => record.assignmentStatus === 'Graded').length /
            progressRecords.length) *
            100,
        );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team adoption dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          {employees.length} employee{employees.length === 1 ? '' : 's'} · {overallCompletion}%
          overall module completion
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Employee</th>
              <th className="px-4 py-2 font-medium">Progress</th>
              <th className="px-4 py-2 font-medium">Last active</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  No employees yet — invite your team from the Team Roster page.
                </td>
              </tr>
            ) : (
              rows.map(({ employee, completed, total, lastActivityAt, atRisk }) => (
                <tr key={employee.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.email}</p>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {completed}/{total || 0}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {lastActivityAt ? lastActivityAt.toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {atRisk ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        At risk
                      </span>
                    ) : (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Engaged
                      </span>
                    )}
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
