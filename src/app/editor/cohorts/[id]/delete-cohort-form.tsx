'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-context';

import { deleteCohortAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function DeleteCohortForm({ cohortId }: { cohortId: string }) {
  const { t: dict } = useLocale();
  const c = dict.editor.common;
  const [state, formAction, isPending] = useActionState(deleteCohortAction, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(c.deleteConfirm)) event.preventDefault();
      }}
    >
      <input type="hidden" name="cohortId" value={cohortId} />
      <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
        {isPending ? c.deleting : c.delete}
      </Button>
      {state.error ? <p className="mt-2 text-fine text-destructive">{state.error}</p> : null}
    </form>
  );
}
