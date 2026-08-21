'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';

import { assignInstructorAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function AssignForm({
  instructors,
  tenants,
}: {
  instructors: { id: string; name: string }[];
  tenants: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(assignInstructorAction, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-4"
    >
      <select
        name="instructorId"
        required
        className="h-8 min-w-40 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {instructors.map((instructor) => (
          <option key={instructor.id} value={instructor.id}>
            {instructor.name}
          </option>
        ))}
      </select>
      <select
        name="tenantId"
        required
        className="h-8 min-w-40 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Assigning…' : 'Assign'}
      </Button>
      {state.error ? <p className="w-full text-xs text-destructive">{state.error}</p> : null}
      {state.success ? <p className="w-full text-xs text-primary">{state.success}</p> : null}
    </form>
  );
}
