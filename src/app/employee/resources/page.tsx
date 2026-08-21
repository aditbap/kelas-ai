import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

const TYPES = ['Tip', 'Template', 'Guide'] as const;

export default async function EmployeeResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const session = await requireRole(Role.Employee);
  const { type, q } = await searchParams;

  const resources = await prisma.resourceItem.findMany({
    where: {
      OR: [{ isGlobal: true }, { tenantId: session.tenantId }],
      ...(type ? { type: type as (typeof TYPES)[number] } : {}),
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">AI Resource Library</h1>
      <p className="mt-2 text-muted-foreground">Tips, prompting templates, and guides.</p>

      <form className="mt-6 flex flex-wrap gap-2" action="/employee/resources">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title…"
          className="h-8 min-w-48 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <select
          name="type"
          defaultValue={type ?? ''}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All types</option>
          {TYPES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Filter
        </button>
      </form>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {resources.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing matches yet.
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
              {resource.tags.length > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">{resource.tags.join(', ')}</p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
