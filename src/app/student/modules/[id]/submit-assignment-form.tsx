'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/lib/i18n/locale-context';

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
  const { t } = useLocale();
  const s = t.student.submitAssignment;
  const isText = submissionType === 'Text';

  return (
    <form action={formAction} className="mt-2 space-y-2">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      {isText ? (
        <Textarea
          key={assignmentId}
          name="content"
          defaultValue={existingContent ?? ''}
          placeholder={s.yourAnswer}
          required
        />
      ) : (
        <Input
          key={assignmentId}
          name="content"
          defaultValue={existingContent ?? ''}
          placeholder={s.urlPlaceholder.replace('{type}', submissionType)}
          required
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? s.submitting : existingContent ? s.resubmit : s.submit}
        </Button>
        {state.error ? <p className="text-fine text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-fine text-action">{state.success}</p> : null}
      </div>
    </form>
  );
}
