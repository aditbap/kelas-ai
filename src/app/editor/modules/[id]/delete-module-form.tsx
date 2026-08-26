'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';

import { deleteModuleAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function DeleteModuleForm({
  moduleId,
  t,
}: {
  moduleId: string;
  t: { deleteConfirm: string; deleteSubmit: string; deleting: string };
}) {
  const [state, formAction, isPending] = useActionState(deleteModuleAction, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(t.deleteConfirm)) event.preventDefault();
      }}
    >
      <input type="hidden" name="moduleId" value={moduleId} />
      <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
        {isPending ? t.deleting : t.deleteSubmit}
      </Button>
      {state.error ? <p className="mt-2 text-fine text-destructive">{state.error}</p> : null}
    </form>
  );
}
