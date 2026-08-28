'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useLocale } from '@/lib/i18n/locale-context';

import { deleteAssignmentAction, updateAssignmentAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export function EditAssignmentForm({
  assignment,
  t,
}: {
  assignment: {
    id: string;
    instructions: string;
    submissionType: string;
    dueDate: Date | null;
    isAdvancedMaterial: boolean;
  };
  t: Dictionary['editor']['moduleDetail']['addAssignmentForm'];
}) {
  const { t: dict } = useLocale();
  const c = dict.editor.common;

  const [editState, editAction, isEditing] = useActionState(updateAssignmentAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteAssignmentAction,
    initialState,
  );

  const dueDateValue = assignment.dueDate ? assignment.dueDate.toISOString().slice(0, 10) : '';

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-fine text-action">
        <span className="group-open:hidden">{c.edit}</span>
        <span className="hidden group-open:inline">{c.cancel}</span>
      </summary>

      <div className="mt-3 space-y-3 border-t border-divider-soft pt-3">
        <form action={editAction} className="space-y-3">
          <input type="hidden" name="assignmentId" value={assignment.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`assignment-instructions-${assignment.id}`}>
              {t.instructionsLabel}
            </Label>
            <Input
              id={`assignment-instructions-${assignment.id}`}
              name="instructions"
              defaultValue={assignment.instructions}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`assignment-type-${assignment.id}`}>{t.submissionTypeLabel}</Label>
            <select
              id={`assignment-type-${assignment.id}`}
              name="submissionType"
              defaultValue={assignment.submissionType}
              className="h-8 w-full rounded-lg border border-hairline bg-transparent px-2.5 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
            >
              <option value="Text">Text</option>
              <option value="Link">Link</option>
              <option value="File">File (URL)</option>
            </select>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`assignment-due-${assignment.id}`}>{t.dueDateLabel}</Label>
              <Input
                id={`assignment-due-${assignment.id}`}
                name="dueDate"
                type="date"
                defaultValue={dueDateValue}
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-caption text-ink-muted">
              <input
                type="checkbox"
                name="isAdvancedMaterial"
                defaultChecked={assignment.isAdvancedMaterial}
                className="size-3.5"
              />
              {t.advancedCheckboxLabel}
            </label>
          </div>
          {editState.error ? <p className="text-fine text-destructive">{editState.error}</p> : null}
          {editState.success ? <p className="text-fine text-action">{editState.success}</p> : null}
          <Button type="submit" size="sm" disabled={isEditing}>
            {isEditing ? c.saving : c.save}
          </Button>
        </form>

        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!confirm(c.deleteConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="assignmentId" value={assignment.id} />
          <Button type="submit" size="sm" variant="destructive" disabled={isDeleting}>
            {isDeleting ? c.deleting : c.delete}
          </Button>
        </form>
        {deleteState.error ? (
          <p className="text-fine text-destructive">{deleteState.error}</p>
        ) : null}
      </div>
    </details>
  );
}
