'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/lib/i18n/locale-context';

import { updateModuleAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function EditModuleForm({
  moduleId,
  title,
  description,
}: {
  moduleId: string;
  title: string;
  description: string | null;
}) {
  const { t: dict } = useLocale();
  const c = dict.editor.common;
  const f = dict.editor.modules.createForm;
  const [state, formAction, isPending] = useActionState(updateModuleAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="moduleId" value={moduleId} />
      <div className="space-y-1.5">
        <Label htmlFor="module-title">{f.titleLabel}</Label>
        <Input id="module-title" name="title" defaultValue={title} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="module-description">{f.descriptionLabel}</Label>
        <Input
          id="module-description"
          name="description"
          defaultValue={description ?? ''}
          placeholder={f.descriptionPlaceholder}
        />
      </div>
      {state.error ? <p className="text-fine text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-fine text-action">{state.success}</p> : null}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? c.saving : c.save}
      </Button>
    </form>
  );
}
