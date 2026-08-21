'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { importEmployeesAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function ImportForm() {
  const [state, formAction, isPending] = useActionState(importEmployeesAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">Bulk import (CSV)</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Columns: name, email — one row per employee.
      </p>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="file">CSV file</Label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
        </div>
        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-xs text-primary">{state.success}</p> : null}
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="w-full justify-center"
          disabled={isPending}
        >
          {isPending ? 'Importing…' : 'Import CSV'}
        </Button>
      </div>
    </form>
  );
}
