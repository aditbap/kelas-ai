'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useLocale } from '@/lib/i18n/locale-context';

import {
  deleteLessonAction,
  moveLessonAction,
  updateLessonAction,
  type ActionState,
} from '../actions';

const initialState: ActionState = {};

export function EditLessonForm({
  lesson,
  t,
  lessonKindLabel,
  canMoveUp,
  canMoveDown,
}: {
  lesson: {
    id: string;
    title: string;
    kind: string;
    contentType: string;
    content: string | null;
  };
  t: Dictionary['editor']['moduleDetail']['addLessonForm'];
  lessonKindLabel: Dictionary['student']['moduleDetail']['lessonKindLabel'];
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const { t: dict } = useLocale();
  const c = dict.editor.common;

  const [editState, editAction, isEditing] = useActionState(updateLessonAction, initialState);
  const [moveState, moveAction, isMoving] = useActionState(moveLessonAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteLessonAction, initialState);

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-fine text-action">
        <span className="group-open:hidden">{c.edit}</span>
        <span className="hidden group-open:inline">{c.cancel}</span>
      </summary>

      <div className="mt-3 space-y-3 border-t border-divider-soft pt-3">
        <form action={editAction} className="space-y-3">
          <input type="hidden" name="lessonId" value={lesson.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`lesson-title-${lesson.id}`}>{t.titleLabel}</Label>
            <Input
              id={`lesson-title-${lesson.id}`}
              name="title"
              defaultValue={lesson.title}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`lesson-kind-${lesson.id}`}>{t.kindLabel}</Label>
            <select
              id={`lesson-kind-${lesson.id}`}
              name="kind"
              defaultValue={lesson.kind}
              className="h-8 w-full rounded-lg border border-hairline bg-transparent px-2.5 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
            >
              <option value="Objectives">{lessonKindLabel.Objectives}</option>
              <option value="Summary">{lessonKindLabel.Summary}</option>
              <option value="Practice">{lessonKindLabel.Practice}</option>
              <option value="Supplementary">{lessonKindLabel.Supplementary}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`lesson-type-${lesson.id}`}>{t.typeLabel}</Label>
            <select
              id={`lesson-type-${lesson.id}`}
              name="contentType"
              defaultValue={lesson.contentType}
              className="h-8 w-full rounded-lg border border-hairline bg-transparent px-2.5 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
            >
              <option value="Text">Text</option>
              <option value="Video">Video (URL)</option>
              <option value="File">File (URL)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`lesson-content-${lesson.id}`}>{t.contentLabel}</Label>
            <Input
              id={`lesson-content-${lesson.id}`}
              name="content"
              defaultValue={lesson.content ?? ''}
            />
          </div>
          {editState.error ? <p className="text-fine text-destructive">{editState.error}</p> : null}
          {editState.success ? <p className="text-fine text-action">{editState.success}</p> : null}
          <Button type="submit" size="sm" disabled={isEditing}>
            {isEditing ? c.saving : c.save}
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <form action={moveAction} className="flex items-center gap-1">
            <input type="hidden" name="lessonId" value={lesson.id} />
            <button
              type="submit"
              name="direction"
              value="up"
              disabled={!canMoveUp || isMoving}
              aria-label={c.moveUp}
              className="flex size-7 items-center justify-center rounded-md border border-hairline text-fine text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
            >
              ↑
            </button>
            <button
              type="submit"
              name="direction"
              value="down"
              disabled={!canMoveDown || isMoving}
              aria-label={c.moveDown}
              className="flex size-7 items-center justify-center rounded-md border border-hairline text-fine text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
            >
              ↓
            </button>
          </form>
          <form
            action={deleteAction}
            onSubmit={(event) => {
              if (!confirm(c.deleteConfirm)) event.preventDefault();
            }}
          >
            <input type="hidden" name="lessonId" value={lesson.id} />
            <Button type="submit" size="sm" variant="destructive" disabled={isDeleting}>
              {isDeleting ? c.deleting : c.delete}
            </Button>
          </form>
        </div>
        {moveState.error ? <p className="text-fine text-destructive">{moveState.error}</p> : null}
        {deleteState.error ? (
          <p className="text-fine text-destructive">{deleteState.error}</p>
        ) : null}
      </div>
    </details>
  );
}
