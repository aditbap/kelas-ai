import { BookOpen, FileText, Lightbulb, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { hasAllAccess } from '@/lib/access';
import { Button } from '@/components/ui/button';
import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/get-locale';
import { requireRole } from '@/lib/session';
import { cn } from '@/lib/utils';

const TYPES = ['Tip', 'Template', 'Guide'] as const;

const TYPE_ICON: Record<(typeof TYPES)[number], typeof Lightbulb> = {
  Tip: Lightbulb,
  Template: FileText,
  Guide: BookOpen,
};

export default async function StudentResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const session = await requireRole(Role.Student);
  const { type, q } = await searchParams;
  const { t } = await getTranslations();
  const s = t.student.resources;

  if (!(await hasAllAccess(session.userId))) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-display-md">{s.title}</h1>
        <div className="mt-6 rounded-lg border border-hairline bg-parchment p-6 text-caption">
          <p className="font-medium text-ink">{s.getAllAccessTitle}</p>
          <div className="mt-4">
            <Button render={<Link href="/student/checkout">{s.getAllAccessCta}</Link>} />
          </div>
        </div>
      </div>
    );
  }

  const resources = await prisma.resourceItem.findMany({
    where: {
      ...(type ? { type: type as (typeof TYPES)[number] } : {}),
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  function typeHref(value: string | undefined) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (value) params.set('type', value);
    const query = params.toString();
    return query ? `/student/resources?${query}` : '/student/resources';
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-display-md">{s.title}</h1>
      <p className="mt-2 text-ink-muted">{s.subtitle}</p>

      <form className="mt-6 flex items-center gap-2" action="/student/resources">
        {type ? <input type="hidden" name="type" value={type} /> : null}
        <div className="relative min-w-48 flex-1">
          <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={s.searchPlaceholder}
            className="h-9 w-full rounded-lg border border-hairline bg-transparent py-1.5 pr-2.5 pl-8 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
          />
        </div>
        <button
          type="submit"
          className="h-9 shrink-0 rounded-lg bg-action px-3.5 text-caption font-medium text-white hover:bg-action/80"
        >
          {s.filter}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={typeHref(undefined)}
            className={cn(
              'rounded-full border px-3 py-1 text-fine font-medium transition-colors',
              !type
                ? 'border-action bg-action text-white'
                : 'border-hairline text-ink-muted hover:text-ink',
            )}
          >
            {s.allTypes}
          </Link>
          {TYPES.map((value) => (
            <Link
              key={value}
              href={typeHref(value)}
              className={cn(
                'rounded-full border px-3 py-1 text-fine font-medium transition-colors',
                type === value
                  ? 'border-action bg-action text-white'
                  : 'border-hairline text-ink-muted hover:text-ink',
              )}
            >
              {value}
            </Link>
          ))}
        </div>
        <p className="text-fine text-ink-muted">{s.resultsCount(resources.length)}</p>
      </div>

      {resources.length === 0 ? (
        <div className="mt-6 rounded-xl border border-hairline bg-elevated p-8 text-center text-caption text-ink-muted">
          {s.none}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => {
            const Icon = TYPE_ICON[resource.type];
            return (
              <div
                key={resource.id}
                className="flex h-full flex-col rounded-xl border border-hairline bg-elevated p-5 transition-shadow hover:shadow-product"
              >
                <div className="flex items-center gap-1.5 text-fine font-medium text-action">
                  <Icon weight="bold" className="h-4 w-4" />
                  {resource.type}
                </div>
                <h2 className="mt-2 text-base font-semibold text-ink">{resource.title}</h2>
                <p className="mt-2 flex-1 text-sm text-ink-muted line-clamp-4">
                  {resource.content}
                </p>
                {resource.tags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-hairline px-2 py-0.5 text-fine text-ink-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
