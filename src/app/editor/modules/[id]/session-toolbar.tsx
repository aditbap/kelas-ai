'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/lib/i18n/locale-context';

import {
  deleteSessionAction,
  moveSessionAction,
  updateSessionAction,
  type ActionState,
} from '../actions';

const initialState: ActionState = {};

export function SessionToolbar({
  sessionId,
  title,
  canMoveUp,
  canMoveDown,
}: {
  sessionId: string;
  title: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const { t: dict } = useLocale();
  const c = dict.editor.common;

  const [renameState, renameAction, isRenaming] = useActionState(updateSessionAction, initialState);
  const [moveState, moveAction, isMoving] = useActionState(moveSessionAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteSessionAction, initialState);

  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <form action={renameAction} className="flex items-center gap-2">
          <input type="hidden" name="sessionId" value={sessionId} />
          <Input name="title" defaultValue={title} className="h-9 max-w-xs" />
          <Button type="submit" size="sm" variant="secondary" disabled={isRenaming}>
            {isRenaming ? c.saving : c.save}
          </Button>
        </form>

        <form action={moveAction} className="flex items-center gap-1">
          <input type="hidden" name="sessionId" value={sessionId} />
          <button
            type="submit"
            name="direction"
            value="up"
            disabled={!canMoveUp || isMoving}
            aria-label={c.moveUp}
            className="flex size-8 items-center justify-center rounded-md border border-hairline text-caption text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            ↑
          </button>
          <button
            type="submit"
            name="direction"
            value="down"
            disabled={!canMoveDown || isMoving}
            aria-label={c.moveDown}
            className="flex size-8 items-center justify-center rounded-md border border-hairline text-caption text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
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
          <input type="hidden" name="sessionId" value={sessionId} />
          <Button type="submit" size="sm" variant="destructive" disabled={isDeleting}>
            {isDeleting ? c.deleting : c.delete}
          </Button>
        </form>
      </div>
      {renameState.error ? <p className="text-fine text-destructive">{renameState.error}</p> : null}
      {renameState.success ? <p className="text-fine text-action">{renameState.success}</p> : null}
      {moveState.error ? <p className="text-fine text-destructive">{moveState.error}</p> : null}
      {deleteState.error ? <p className="text-fine text-destructive">{deleteState.error}</p> : null}
    </div>
  );
}
