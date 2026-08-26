'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { addCohortMemberAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function AddMemberForm({
  cohortId,
  t,
}: {
  cohortId: string;
  t: Dictionary['editor']['cohorts']['detail']['addMemberForm'];
}) {
  const [state, formAction, isPending] = useActionState(addCohortMemberAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="cohortId" value={cohortId} />
      <div className="min-w-56 flex-1 space-y-1.5">
        <Label htmlFor="email">{t.emailLabel}</Label>
        <Input id="email" name="email" type="email" required placeholder={t.emailPlaceholder} />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? t.adding : t.submit}
      </Button>
      {state.error ? <p className="w-full text-fine text-destructive">{state.error}</p> : null}
      {state.success ? <p className="w-full text-fine text-action">{state.success}</p> : null}
    </form>
  );
}
