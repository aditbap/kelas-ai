'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { gradeSubmissionAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function GradeForm({
  submissionId,
  t,
}: {
  submissionId: string;
  t: Dictionary['editor']['grading']['form'];
}) {
  const [state, formAction, isPending] = useActionState(gradeSubmissionAction, initialState);

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="submissionId" value={submissionId} />
      <div className="w-20">
        <Input name="score" type="number" placeholder={t.scorePlaceholder} />
      </div>
      <select
        name="passFail"
        className="h-8 rounded-lg border border-hairline bg-transparent px-2.5 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
      >
        <option value="">{t.noPassFail}</option>
        <option value="pass">{t.pass}</option>
        <option value="fail">{t.fail}</option>
      </select>
      <div className="min-w-48 flex-1">
        <Input name="feedbackText" placeholder={t.feedbackPlaceholder} />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? t.grading : t.submit}
      </Button>
      {state.error ? <p className="w-full text-fine text-destructive">{state.error}</p> : null}
      {state.success ? <p className="w-full text-fine text-action">{state.success}</p> : null}
    </form>
  );
}
