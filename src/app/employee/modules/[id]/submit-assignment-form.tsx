'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { submitAssignmentAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function SubmitAssignmentForm({
  assignmentId,
  submissionType,
  existingContent,
}: {
  assignmentId: string;
  submissionType: string;
  existingContent?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(submitAssignmentAction, initialState);

  return (
    <form action={formAction} className="mt-2 flex flex-wrap items-end gap-2">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <div className="min-w-56 flex-1">
        <Input
          name="content"
          defaultValue={existingContent ?? ''}
          placeholder={submissionType === 'Text' ? 'Your answer' : `${submissionType} URL`}
          required
        />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Submitting…' : existingContent ? 'Resubmit' : 'Submit'}
      </Button>
      {state.error ? <p className="w-full text-xs text-destructive">{state.error}</p> : null}
      {state.success ? <p className="w-full text-xs text-primary">{state.success}</p> : null}
    </form>
  );
}
