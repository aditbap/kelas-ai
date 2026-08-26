'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-context';

import { setModulePrerequisiteAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function PrerequisiteForm({
  moduleId,
  currentPrerequisiteId,
  otherModules,
}: {
  moduleId: string;
  currentPrerequisiteId: string | null;
  otherModules: { id: string; title: string }[];
}) {
  // Read translations from context rather than props: the studio dictionary
  // carries interpolation functions, which cannot cross into a Client
  // Component as props.
  const { t: dict } = useLocale();
  const t = dict.editor.studio;
  const [state, formAction, isPending] = useActionState(setModulePrerequisiteAction, initialState);

  if (otherModules.length === 0) {
    return <p className="text-caption text-ink-muted">{t.noOtherModules}</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2.5">
      <input type="hidden" name="moduleId" value={moduleId} />
      <select
        name="prerequisiteModuleId"
        defaultValue={currentPrerequisiteId ?? ''}
        aria-label={t.prerequisiteLabel}
        className="h-11 min-w-0 flex-[1_1_240px] rounded-full border border-hairline bg-elevated px-5 text-caption text-ink outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
      >
        <option value="">{t.prerequisiteNone}</option>
        {otherModules.map((module_) => (
          <option key={module_.id} value={module_.id}>
            {module_.title}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={isPending}>
        {isPending ? t.prerequisiteSaving : t.prerequisiteSubmit}
      </Button>
      {state.error ? <p className="w-full text-fine text-destructive">{state.error}</p> : null}
      {state.success ? <p className="w-full text-fine text-action">{state.success}</p> : null}
    </form>
  );
}
