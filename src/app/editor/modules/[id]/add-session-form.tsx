'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { addSessionAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function AddSessionForm({
  moduleId,
  t,
}: {
  moduleId: string;
  t: Dictionary['editor']['moduleDetail']['addSessionForm'];
}) {
  const [state, formAction, isPending] = useActionState(addSessionAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-hairline p-4">
      <input type="hidden" name="moduleId" value={moduleId} />
      <h3 className="text-caption font-semibold">{t.heading}</h3>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="session-title">{t.titleLabel}</Label>
          <Input id="session-title" name="title" placeholder={t.titlePlaceholder} required />
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
