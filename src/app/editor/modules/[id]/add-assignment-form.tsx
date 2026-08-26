'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { addAssignmentAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function AddAssignmentForm({
  sessionId,
  t,
}: {
  sessionId: string;
  t: Dictionary['editor']['moduleDetail']['addAssignmentForm'];
}) {
  const [state, formAction, isPending] = useActionState(addAssignmentAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-hairline p-4">
      <input type="hidden" name="sessionId" value={sessionId} />
      <h3 className="text-caption font-semibold">{t.heading}</h3>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="instructions">{t.instructionsLabel}</Label>
          <Input id="instructions" name="instructions" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="submissionType">{t.submissionTypeLabel}</Label>
          <select
            id="submissionType"
            name="submissionType"
            className="h-8 w-full rounded-lg border border-hairline bg-transparent px-2.5 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
          >
            <option value="Text">Text</option>
            <option value="Link">Link</option>
            <option value="File">File (URL)</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="dueDate">{t.dueDateLabel}</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>
          <label className="flex items-center gap-2 pb-2 text-caption text-ink-muted">
            <input type="checkbox" name="isAdvancedMaterial" className="size-3.5" />
            {t.advancedCheckboxLabel}
          </label>
        </div>
        {state.error ? <p className="text-fine text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-fine text-action">{state.success}</p> : null}
        <Button type="submit" size="sm" className="w-full justify-center" disabled={isPending}>
          {isPending ? t.adding : t.submit}
        </Button>
      </div>
    </form>
  );
}
