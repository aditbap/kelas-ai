/**
 * Prerequisites form a chain: a module can require another, which can itself
 * require a third. Pointing A at B when B already leads back to A would make
 * both modules permanently locked, since `isModuleUnlockedForUser` waits for a
 * prerequisite that can never complete.
 *
 * The lookup is injected rather than importing Prisma directly, so the walk is
 * pure enough to test without a database.
 */
export async function wouldCreatePrerequisiteCycle(
  moduleId: string,
  candidatePrerequisiteId: string,
  getPrerequisiteOf: (id: string) => Promise<string | null>,
): Promise<boolean> {
  if (candidatePrerequisiteId === moduleId) return true;

  let cursor: string | null = candidatePrerequisiteId;
  // Guards against a cycle that does not include `moduleId` itself - bad data
  // like B→C→B would otherwise spin this loop forever.
  const visited = new Set<string>();

  while (cursor) {
    if (cursor === moduleId) return true;
    if (visited.has(cursor)) return false;
    visited.add(cursor);
    cursor = await getPrerequisiteOf(cursor);
  }

  return false;
}
