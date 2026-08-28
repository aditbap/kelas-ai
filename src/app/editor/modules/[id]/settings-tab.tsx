import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils';

import { DeleteModuleForm } from './delete-module-form';
import { EditModuleForm } from './edit-module-form';
import { PrerequisiteForm } from './prerequisite-form';
import { PublishForm } from './publish-form';

/*
  The design's settings screen: a stack of hairline-separated rows, each
  pairing a label column with its control — visibility, prerequisite, and
  danger-zone deletion.
*/
export function SettingsTab({
  moduleId,
  title,
  description,
  isPublished,
  prerequisiteModuleId,
  otherModules,
  t,
  publishFormT,
}: {
  moduleId: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  prerequisiteModuleId: string | null;
  otherModules: { id: string; title: string }[];
  t: Dictionary['editor']['studio'];
  publishFormT: Dictionary['editor']['moduleDetail']['publishForm'];
}) {
  const rows = [
    {
      label: t.detailsLabel,
      note: t.detailsNote,
      control: <EditModuleForm moduleId={moduleId} title={title} description={description} />,
    },
    {
      label: t.visibilityLabel,
      note: t.visibilityNote,
      control: <PublishForm moduleId={moduleId} isPublished={isPublished} t={publishFormT} />,
    },
    {
      label: t.prerequisiteLabel,
      note: t.prerequisiteNote,
      control: (
        <PrerequisiteForm
          moduleId={moduleId}
          currentPrerequisiteId={prerequisiteModuleId}
          otherModules={otherModules}
        />
      ),
    },
    {
      label: t.dangerZoneLabel,
      note: t.dangerZoneNote,
      control: (
        <DeleteModuleForm
          moduleId={moduleId}
          t={{
            deleteConfirm: t.deleteConfirm,
            deleteSubmit: t.deleteSubmit,
            deleting: t.deleting,
          }}
        />
      ),
    },
  ];

  return (
    <div className="max-w-[980px]">
      <h1 className="mb-2 text-display-lg text-ink text-pretty">{t.settingsTitle}</h1>
      <p className="mb-12 max-w-[620px] text-body text-ink-muted">{t.settingsSubtitle}</p>

      <div className="flex flex-col">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={cn(
              'flex flex-wrap gap-x-8 gap-y-4 border-t border-hairline py-7',
              index === rows.length - 1 && 'border-b',
            )}
          >
            <div className="min-w-[200px] flex-[0_1_240px]">
              <p className="text-body font-semibold text-ink">{row.label}</p>
              <p className="mt-0.5 text-caption text-ink-muted">{row.note}</p>
            </div>
            <div className="min-w-0 flex-[1_1_320px]">{row.control}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
