'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';

import { publishToCohortAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function PublishForm({
  moduleId,
  cohorts,
}: {
  moduleId: string;
  cohorts: { id: string; name: string; tenantName: string }[];
}) {
  const [state, formAction, isPending] = useActionState(publishToCohortAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="moduleId" value={moduleId} />
      <div className="min-w-56 flex-1">
        <select
          name="cohortId"
          required
          disabled={cohorts.length === 0}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {cohorts.length === 0 ? (
            <option value="">No cohorts available to publish to</option>
          ) : (
            cohorts.map((cohort) => (
              <option key={cohort.id} value={cohort.id}>
                {cohort.name} ({cohort.tenantName})
              </option>
            ))
          )}
        </select>
      </div>
      <Button type="submit" size="sm" disabled={isPending || cohorts.length === 0}>
        {isPending ? 'Publishing…' : 'Publish'}
      </Button>
      {state.error ? <p className="w-full text-xs text-destructive">{state.error}</p> : null}
      {state.success ? <p className="w-full text-xs text-primary">{state.success}</p> : null}
    </form>
  );
}
