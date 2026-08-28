'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useLocale } from '@/lib/i18n/locale-context';

import { deleteResourceAction, updateResourceAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function EditResourceForm({
  resource,
  t,
}: {
  resource: { id: string; type: string; title: string; content: string; tags: string[] };
  t: Dictionary['editor']['resources']['createForm'];
}) {
  const { t: dict } = useLocale();
  const c = dict.editor.common;

  const [editState, editAction, isEditing] = useActionState(updateResourceAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteResourceAction,
    initialState,
  );

  return (
    <details className="mt-2 group">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-fine text-action">
        <span className="group-open:hidden">{c.edit}</span>
        <span className="hidden group-open:inline">{c.cancel}</span>
      </summary>

      <div className="mt-3 space-y-3 border-t border-divider-soft pt-3">
        <form action={editAction} className="space-y-3">
          <input type="hidden" name="resourceId" value={resource.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`resource-type-${resource.id}`}>{t.typeLabel}</Label>
            <select
              id={`resource-type-${resource.id}`}
              name="type"
              defaultValue={resource.type}
              className="h-8 w-full rounded-lg border border-hairline bg-transparent px-2.5 text-caption outline-none focus-visible:border-action focus-visible:ring-[3px] focus-visible:ring-action/25"
            >
              <option value="Tip">Tip</option>
              <option value="Template">Template</option>
              <option value="Guide">Guide</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`resource-title-${resource.id}`}>{t.titleLabel}</Label>
            <Input
              id={`resource-title-${resource.id}`}
              name="title"
              defaultValue={resource.title}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`resource-content-${resource.id}`}>{t.contentLabel}</Label>
            <Input
              id={`resource-content-${resource.id}`}
              name="content"
              defaultValue={resource.content}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`resource-tags-${resource.id}`}>{t.tagsLabel}</Label>
            <Input
              id={`resource-tags-${resource.id}`}
              name="tags"
              defaultValue={resource.tags.join(', ')}
              placeholder={t.tagsPlaceholder}
            />
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
          <input type="hidden" name="resourceId" value={resource.id} />
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
