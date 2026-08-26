'use client';

import { CheckCircle } from '@phosphor-icons/react';
import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { submitConsultationAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function ConsultationForm({ t }: { t: Dictionary['consultation']['form'] }) {
  const [state, formAction, isPending] = useActionState(submitConsultationAction, initialState);

  if (state.success) {
    return (
      <div role="status" className="rounded-lg border border-hairline bg-pearl p-8 text-center">
        <CheckCircle size={28} weight="fill" className="mx-auto text-action" />
        <p className="mt-3 text-body text-ink">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="name">{t.name}</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="company">{t.company}</Label>
        <Input id="company" name="company" required autoComplete="organization" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">{t.email}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="seats">{t.seats}</Label>
        <Input id="seats" name="seats" type="number" min={1} inputMode="numeric" />
      </div>

      {state.error ? (
        <p role="alert" className="text-caption text-destructive">
          {state.error}
        </p>
      ) : null}

      {/* Label is the form action, not a second "Book a Consultation" CTA. */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t.submitPending : t.submit}
      </Button>
    </form>
  );
}
