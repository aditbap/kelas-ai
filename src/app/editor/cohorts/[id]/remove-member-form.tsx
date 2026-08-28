'use client';

import { useActionState } from 'react';

import type { Dictionary } from '@/lib/i18n/dictionaries';

import { removeCohortMemberAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function RemoveMemberForm({
  cohortId,
  userId,
  label,
}: {
  cohortId: string;
  userId: string;
  label: Dictionary['editor']['cohorts']['detail']['remove'];
}) {
  const [state, formAction, isPending] = useActionState(removeCohortMemberAction, initialState);

  return (
    <form action={formAction} className="shrink-0 text-right">
      <input type="hidden" name="cohortId" value={cohortId} />
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        disabled={isPending}
        className="text-fine text-destructive hover:underline disabled:opacity-50"
      >
        {label}
      </button>
      {state.error ? <p className="mt-1 text-fine text-destructive">{state.error}</p> : null}
    </form>
  );
}
