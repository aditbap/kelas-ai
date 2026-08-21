import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import { CreateResourceForm } from './create-resource-form';

export default async function InstructorResourcesPage() {
  const session = await requireRole(Role.Instructor);

  const [resources, assignments] = await Promise.all([
    prisma.resourceItem.findMany({
      where: {
        OR: [
          { isGlobal: true },
          { tenant: { instructorTenantAssignments: { some: { instructorId: session.userId } } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.instructorTenantAssignment.findMany({
      where: { instructorId: session.userId },
      include: { tenant: true },
    }),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Resource Library</h1>
      <p className="mt-2 text-muted-foreground">
        Tips, templates, and guides — global or scoped to one of your tenants.
      </p>

      <div className="mt-8 max-w-sm">
        <CreateResourceForm
          tenants={assignments.map((assignment) => ({
            id: assignment.tenant.id,
            name: assignment.tenant.name,
          }))}
        />
      </div>

      <ul className="mt-10 divide-y divide-border rounded-lg border border-border">
        {resources.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing published yet.
          </li>
        ) : (
          resources.map((resource) => (
            <li key={resource.id} className="px-4 py-3">
              <p className="text-sm font-medium">
                {resource.title}{' '}
                <span className="ml-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {resource.type}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{resource.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {resource.isGlobal ? 'Global' : 'Tenant-specific'}
                {resource.tags.length > 0 ? ` · ${resource.tags.join(', ')}` : ''}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
