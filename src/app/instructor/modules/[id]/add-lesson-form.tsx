'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { addLessonAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function AddLessonForm({ moduleId }: { moduleId: string }) {
  const [state, formAction, isPending] = useActionState(addLessonAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-border p-4">
      <input type="hidden" name="moduleId" value={moduleId} />
      <h3 className="text-sm font-semibold">Add lesson</h3>
      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="lesson-title">Title</Label>
          <Input id="lesson-title" name="title" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contentType">Type</Label>
          <select
            id="contentType"
            name="contentType"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="Text">Text</option>
            <option value="Video">Video (URL)</option>
            <option value="File">File (URL)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="content">Content / URL</Label>
          <Input id="content" name="content" />
        </div>
        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-xs text-primary">{state.success}</p> : null}
        <Button type="submit" size="sm" className="w-full justify-center" disabled={isPending}>
          {isPending ? 'Adding…' : 'Add Lesson'}
        </Button>
      </div>
    </form>
  );
}
