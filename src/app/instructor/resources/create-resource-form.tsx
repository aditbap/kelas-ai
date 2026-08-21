'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createResourceAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function CreateResourceForm({ tenants }: { tenants: { id: string; name: string }[] }) {
  const [state, formAction, isPending] = useActionState(createResourceAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">New resource</h2>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="Tip">Tip</option>
            <option value="Template">Template</option>
            <option value="Guide">Guide</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="content">Content</Label>
          <Input id="content" name="content" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" name="tags" placeholder="prompting, basics" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="visibility">Visibility</Label>
          <select
            id="visibility"
            name="visibility"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="global">Global (all tenants)</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} only
              </option>
            ))}
          </select>
        </div>
        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-xs text-primary">{state.success}</p> : null}
        <Button type="submit" size="sm" className="w-full justify-center" disabled={isPending}>
          {isPending ? 'Publishing…' : 'Publish Resource'}
        </Button>
      </div>
    </form>
  );
}
