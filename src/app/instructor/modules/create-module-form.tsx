'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createModuleAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function CreateModuleForm() {
  const [state, formAction, isPending] = useActionState(createModuleAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">New module</h2>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Prompt Engineering 101" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="Optional" />
        </div>
        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-xs text-primary">{state.success}</p> : null}
        <Button type="submit" size="sm" className="w-full justify-center" disabled={isPending}>
          {isPending ? 'Creating…' : 'Create Module'}
        </Button>
      </div>
    </form>
  );
}
