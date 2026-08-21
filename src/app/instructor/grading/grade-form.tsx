'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { gradeSubmissionAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function GradeForm({ submissionId }: { submissionId: string }) {
  const [state, formAction, isPending] = useActionState(gradeSubmissionAction, initialState);

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="submissionId" value={submissionId} />
      <div className="w-20">
        <Input name="score" type="number" placeholder="Score" />
      </div>
      <select
        name="passFail"
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">No pass/fail</option>
        <option value="pass">Pass</option>
        <option value="fail">Fail</option>
      </select>
      <div className="min-w-48 flex-1">
        <Input name="feedbackText" placeholder="Feedback (optional)" />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Grading…' : 'Grade'}
      </Button>
      {state.error ? <p className="w-full text-xs text-destructive">{state.error}</p> : null}
      {state.success ? <p className="w-full text-xs text-primary">{state.success}</p> : null}
    </form>
  );
}
