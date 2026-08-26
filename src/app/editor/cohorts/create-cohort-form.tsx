'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { createCohortAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function CreateCohortForm({ t }: { t: Dictionary['editor']['cohorts']['createForm'] }) {
  const [state, formAction, isPending] = useActionState(createCohortAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-hairline p-4">
      <h2 className="text-caption font-semibold">{t.heading}</h2>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t.nameLabel}</Label>
          <Input id="name" name="name" placeholder={t.namePlaceholder} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="onsiteDate">{t.dateLabel}</Label>
          <Input id="onsiteDate" name="onsiteDate" type="date" required />
        </div>
        {state.error ? <p className="text-fine text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-fine text-action">{state.success}</p> : null}
        <Button type="submit" size="sm" className="w-full justify-center" disabled={isPending}>
          {isPending ? t.creating : t.submit}
        </Button>
      </div>
    </form>
  );
}
