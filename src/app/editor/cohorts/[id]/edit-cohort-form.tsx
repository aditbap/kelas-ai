'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useLocale } from '@/lib/i18n/locale-context';

import { updateCohortAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function EditCohortForm({
  cohortId,
  name,
  onsiteDate,
  t,
}: {
  cohortId: string;
  name: string;
  onsiteDate: Date;
  t: Dictionary['editor']['cohorts']['createForm'];
}) {
  const { t: dict } = useLocale();
  const c = dict.editor.common;
  const [state, formAction, isPending] = useActionState(updateCohortAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="cohortId" value={cohortId} />
      <div className="space-y-1.5">
        <Label htmlFor="cohort-name">{t.nameLabel}</Label>
        <Input id="cohort-name" name="name" defaultValue={name} required className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cohort-date">{t.dateLabel}</Label>
        <Input
          id="cohort-date"
          name="onsiteDate"
          type="date"
          defaultValue={onsiteDate.toISOString().slice(0, 10)}
          required
          className="h-9"
        />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? c.saving : c.save}
      </Button>
      {state.error ? <p className="w-full text-fine text-destructive">{state.error}</p> : null}
      {state.success ? <p className="w-full text-fine text-action">{state.success}</p> : null}
    </form>
  );
}
