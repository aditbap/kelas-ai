'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { createResourceAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function CreateResourceForm({ t }: { t: Dictionary['editor']['resources']['createForm'] }) {
  const [state, formAction, isPending] = useActionState(createResourceAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-hairline p-4">
      <h2 className="text-caption font-semibold">{t.heading}</h2>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="type">{t.typeLabel}</Label>
          <select
            id="type"
            name="type"
            className="h-8 w-full rounded-lg border border-hairline bg-transparent px-2.5 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
          >
            <option value="Tip">Tip</option>
            <option value="Template">Template</option>
            <option value="Guide">Guide</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">{t.titleLabel}</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="content">{t.contentLabel}</Label>
          <Input id="content" name="content" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">{t.tagsLabel}</Label>
          <Input id="tags" name="tags" placeholder={t.tagsPlaceholder} />
        </div>
        {state.error ? <p className="text-fine text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-fine text-action">{state.success}</p> : null}
        <Button type="submit" size="sm" className="w-full justify-center" disabled={isPending}>
          {isPending ? t.publishing : t.submit}
        </Button>
      </div>
    </form>
  );
}
