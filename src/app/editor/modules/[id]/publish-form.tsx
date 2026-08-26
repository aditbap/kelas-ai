'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { setModulePublishedAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function PublishForm({
  moduleId,
  isPublished,
  t,
}: {
  moduleId: string;
  isPublished: boolean;
  t: Dictionary['editor']['moduleDetail']['publishForm'];
}) {
  const [state, formAction, isPending] = useActionState(setModulePublishedAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="isPublished" value={(!isPublished).toString()} />
      <Button
        type="submit"
        size="sm"
        variant={isPublished ? 'outline' : 'default'}
        disabled={isPending}
      >
        {isPending ? t.saving : isPublished ? t.unpublish : t.publish}
      </Button>
      {state.error ? <p className="w-full text-fine text-destructive">{state.error}</p> : null}
      {state.success ? <p className="w-full text-fine text-action">{state.success}</p> : null}
    </form>
  );
}
