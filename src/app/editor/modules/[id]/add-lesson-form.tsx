'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import { addLessonAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function AddLessonForm({
  sessionId,
  t,
  lessonKindLabel,
}: {
  sessionId: string;
  t: Dictionary['editor']['moduleDetail']['addLessonForm'];
  lessonKindLabel: Dictionary['student']['moduleDetail']['lessonKindLabel'];
}) {
  const [state, formAction, isPending] = useActionState(addLessonAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-hairline p-4">
      <input type="hidden" name="sessionId" value={sessionId} />
      <h3 className="text-caption font-semibold">{t.heading}</h3>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="lesson-title">{t.titleLabel}</Label>
          <Input id="lesson-title" name="title" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kind">{t.kindLabel}</Label>
          <select
            id="kind"
            name="kind"
            className="h-8 w-full rounded-lg border border-hairline bg-transparent px-2.5 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
          >
            <option value="Objectives">{lessonKindLabel.Objectives}</option>
            <option value="Summary">{lessonKindLabel.Summary}</option>
            <option value="Practice">{lessonKindLabel.Practice}</option>
            <option value="Supplementary">{lessonKindLabel.Supplementary}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contentType">{t.typeLabel}</Label>
          <select
            id="contentType"
            name="contentType"
            className="h-8 w-full rounded-lg border border-hairline bg-transparent px-2.5 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
          >
            <option value="Text">Text</option>
            <option value="Video">Video (URL)</option>
            <option value="File">File (URL)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="content">{t.contentLabel}</Label>
          <Input id="content" name="content" />
        </div>
        {state.error ? <p className="text-fine text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-fine text-action">{state.success}</p> : null}
        <Button type="submit" size="sm" className="w-full justify-center" disabled={isPending}>
          {isPending ? t.adding : t.submit}
        </Button>
      </div>
    </form>
  );
}
