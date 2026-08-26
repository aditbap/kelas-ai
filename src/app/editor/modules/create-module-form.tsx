'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { createModuleAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function CreateModuleForm({
  t,
  existingModules,
}: {
  t: Dictionary['editor']['modules']['createForm'];
  existingModules: { id: string; title: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createModuleAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-hairline p-4">
      <h2 className="text-caption font-semibold">{t.heading}</h2>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="title">{t.titleLabel}</Label>
          <Input id="title" name="title" placeholder={t.titlePlaceholder} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">{t.descriptionLabel}</Label>
          <Input id="description" name="description" placeholder={t.descriptionPlaceholder} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prerequisiteModuleId">{t.prerequisiteLabel}</Label>
          <select
            id="prerequisiteModuleId"
            name="prerequisiteModuleId"
            defaultValue=""
            disabled={existingModules.length === 0}
            className="h-8 w-full rounded-lg border border-hairline bg-transparent px-2.5 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
          >
            <option value="">{t.noPrerequisite}</option>
            {existingModules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
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
