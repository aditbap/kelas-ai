'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createCohortAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function CreateCohortForm({ instructors }: { instructors: { id: string; name: string }[] }) {
  const [state, formAction, isPending] = useActionState(createCohortAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">New cohort</h2>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Q1 AI Onsite" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="onsiteDate">Onsite date</Label>
          <Input id="onsiteDate" name="onsiteDate" type="date" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="instructorId">Instructor</Label>
          <select
            id="instructorId"
            name="instructorId"
            required
            disabled={instructors.length === 0}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {instructors.length === 0 ? (
              <option value="">No instructors assigned yet</option>
            ) : (
              instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ))
            )}
          </select>
        </div>
        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-xs text-primary">{state.success}</p> : null}
        <Button
          type="submit"
          size="sm"
          className="w-full justify-center"
          disabled={isPending || instructors.length === 0}
        >
          {isPending ? 'Creating…' : 'Create Cohort'}
        </Button>
      </div>
    </form>
  );
}
