'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';

import { addCohortMemberAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function AddMemberForm({
  cohortId,
  candidates,
}: {
  cohortId: string;
  candidates: { id: string; name: string; email: string }[];
}) {
  const [state, formAction, isPending] = useActionState(addCohortMemberAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="cohortId" value={cohortId} />
      <div className="flex-1 min-w-48">
        <select
          name="userId"
          required
          disabled={candidates.length === 0}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {candidates.length === 0 ? (
            <option value="">Everyone is already in this cohort</option>
          ) : (
            candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} ({candidate.email})
              </option>
            ))
          )}
        </select>
      </div>
      <Button type="submit" size="sm" disabled={isPending || candidates.length === 0}>
        {isPending ? 'Adding…' : 'Add'}
      </Button>
      {state.error ? <p className="w-full text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}
