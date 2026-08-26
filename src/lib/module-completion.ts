import { AssignmentStatus } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { isModuleUnlocked } from '@/lib/module-lock';
import { average, computeSessionCompletionPercent } from '@/lib/progress';

/** A module's completion is the average completion of its sessions. */
export async function getModuleCompletionPercent(
  userId: string,
  moduleId: string,
): Promise<number> {
  const sessions = await prisma.moduleSession.findMany({
    where: { moduleId },
    include: {
      _count: { select: { lessons: true, assignments: true } },
      progress: { where: { userId } },
    },
  });
  if (sessions.length === 0) return 0;

  const percents = sessions.map((moduleSession) => {
    const progress = moduleSession.progress[0];
    return computeSessionCompletionPercent(
      {
        lessonsCompletedCount: progress?.lessonsCompletedCount ?? 0,
        assignmentStatus: progress?.assignmentStatus ?? AssignmentStatus.NotStarted,
      },
      {
        totalLessons: moduleSession._count.lessons,
        hasAssignment: moduleSession._count.assignments > 0,
      },
    );
  });
  return average(percents);
}

export async function isModuleUnlockedForUser(
  userId: string,
  module: { prerequisiteModuleId: string | null },
): Promise<boolean> {
  if (!module.prerequisiteModuleId) return true;
  const prerequisitePercent = await getModuleCompletionPercent(userId, module.prerequisiteModuleId);
  return isModuleUnlocked(module, new Map([[module.prerequisiteModuleId, prerequisitePercent]]));
}
