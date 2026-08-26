/**
 * A module with a prerequisite is locked until that prerequisite module is
 * 100% complete. Modules with no prerequisite are always unlocked.
 */
export function isModuleUnlocked(
  module: { prerequisiteModuleId: string | null },
  completionPercentByModuleId: Map<string, number>,
): boolean {
  if (!module.prerequisiteModuleId) return true;
  return (completionPercentByModuleId.get(module.prerequisiteModuleId) ?? 0) >= 100;
}
