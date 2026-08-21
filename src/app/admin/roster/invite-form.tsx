'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { inviteEmployeeAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function InviteForm() {
  const [state, formAction, isPending] = useActionState(inviteEmployeeAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">Invite an employee</h2>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-xs text-primary">{state.success}</p> : null}
        <Button type="submit" size="sm" className="w-full justify-center" disabled={isPending}>
          {isPending ? 'Inviting…' : 'Send Invite'}
        </Button>
      </div>
    </form>
  );
}
