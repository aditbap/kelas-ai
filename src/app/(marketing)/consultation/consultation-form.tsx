'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { submitConsultationAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function ConsultationForm() {
  const [state, formAction, isPending] = useActionState(submitConsultationAction, initialState);

  if (state.success) {
    return (
      <p className="rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        {state.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" required autoComplete="organization" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="seats">Approximate seat count</Label>
        <Input id="seats" name="seats" type="number" min={1} />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" className="w-full justify-center" disabled={isPending}>
        {isPending ? 'Sending…' : 'Request a Consultation'}
      </Button>
    </form>
  );
}
