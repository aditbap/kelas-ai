import {
  Article,
  CaretRight,
  CheckCircle,
  ClipboardText,
  FileArrowDown,
  PlayCircle,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import type { PlayerItem } from './data';

const CONTENT_ICON = { Text: Article, Video: PlayCircle, File: FileArrowDown };

export function CourseOutlinePanel({
  moduleId,
  moduleTitle,
  overallPercent,
  overallProgressLabel,
  sessions,
  items,
  currentItemId,
}: {
  moduleId: string;
  moduleTitle: string;
  overallPercent: number;
  overallProgressLabel: string;
  sessions: { id: string; order: number; title: string }[];
  items: PlayerItem[];
  currentItemId: string;
}) {
  return (
    <div>
      <h1 className="text-caption font-semibold text-ink">{moduleTitle}</h1>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
          <div className="h-full rounded-full bg-action" style={{ width: `${overallPercent}%` }} />
        </div>
        <span className="shrink-0 text-fine font-medium text-ink-muted">{overallPercent}%</span>
      </div>
      <p className="mt-1 text-fine text-ink-muted">{overallProgressLabel}</p>

      <div className="mt-4 divide-y divide-hairline rounded-lg border border-hairline">
        {sessions.map((sessionEntry) => {
          const sessionItems = items.filter((item) => item.sessionId === sessionEntry.id);
          const containsCurrent = sessionItems.some((item) => item.itemId === currentItemId);

          return (
            <details key={sessionEntry.id} open={containsCurrent} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-caption font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 truncate">
                  {sessionEntry.order}. {sessionEntry.title}
                </span>
                <CaretRight
                  size={12}
                  weight="bold"
                  className="shrink-0 text-ink-faint transition-transform group-open:rotate-90"
                />
              </summary>
              <ul>
                {sessionItems.map((item) => {
                  const isCurrent = item.itemId === currentItemId;
                  const Icon =
                    item.type === 'assignment'
                      ? ClipboardText
                      : CONTENT_ICON[item.contentType as keyof typeof CONTENT_ICON];

                  return (
                    <li key={item.itemId}>
                      <Link
                        href={`/student/modules/${moduleId}/${item.itemId}`}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-2.5 border-t border-hairline px-3 py-2.5 text-caption transition-colors',
                          isCurrent
                            ? 'bg-elevated font-medium text-ink'
                            : 'text-ink-muted hover:bg-parchment',
                        )}
                      >
                        {item.completed ? (
                          <CheckCircle weight="fill" className="h-4 w-4 shrink-0 text-action" />
                        ) : (
                          <Icon className="h-4 w-4 shrink-0" />
                        )}
                        <span className="min-w-0 flex-1 truncate">
                          {item.type === 'assignment' ? item.instructions : item.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}
