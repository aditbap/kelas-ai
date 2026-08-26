import { hasAllAccess } from '@/lib/access';
import { Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { getModuleCompletionPercent, isModuleUnlockedForUser } from '@/lib/module-completion';
import { requireRole } from '@/lib/session';

export type PlayerItem =
  | {
      type: 'lesson';
      itemId: string;
      lessonId: string;
      sessionId: string;
      title: string;
      contentType: string;
      kind: string;
      content: string | null;
      completed: boolean;
      isNextInOrder: boolean;
    }
  | {
      type: 'assignment';
      itemId: string;
      assignmentId: string;
      sessionId: string;
      instructions: string;
      submissionType: string;
      dueDate: Date | null;
      isAdvancedMaterial: boolean;
      submission: {
        content: string | null;
        grade: {
          score: number | null;
          passFail: boolean | null;
          feedbackText: string | null;
        } | null;
      } | null;
      completed: boolean;
    };

export type ModulePlayerData = {
  module: { id: string; title: string; description: string | null };
  overallPercent: number;
  sessions: { id: string; order: number; title: string }[];
  items: PlayerItem[];
};

export type ModulePlayerResult =
  | { status: 'no-access' }
  | { status: 'not-found' }
  | { status: 'locked'; moduleTitle: string; prerequisiteTitle: string | null }
  | { status: 'ok'; data: ModulePlayerData };

/**
 * Shared by the module-root redirect page and the per-item player page so
 * both agree on the flat, ordered item list (lessons then assignment, per
 * session) that "go to next item" walks through.
 */
export async function loadModulePlayerData(moduleId: string): Promise<ModulePlayerResult> {
  const session = await requireRole(Role.Student);
  if (!(await hasAllAccess(session.userId))) return { status: 'no-access' };

  const module_ = await prisma.module.findFirst({
    where: { id: moduleId, isPublished: true },
    include: {
      prerequisite: true,
      sessions: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' } },
          assignments: {
            include: {
              submissions: { where: { userId: session.userId }, include: { grade: true } },
            },
          },
          progress: { where: { userId: session.userId } },
        },
      },
    },
  });
  if (!module_) return { status: 'not-found' };

  if (!(await isModuleUnlockedForUser(session.userId, module_))) {
    return {
      status: 'locked',
      moduleTitle: module_.title,
      prerequisiteTitle: module_.prerequisite?.title ?? null,
    };
  }

  const overallPercent = await getModuleCompletionPercent(session.userId, module_.id);

  const items: PlayerItem[] = [];
  for (const moduleSession of module_.sessions) {
    const progress = moduleSession.progress[0];
    const completedCount = progress?.lessonsCompletedCount ?? 0;

    moduleSession.lessons.forEach((lesson, index) => {
      items.push({
        type: 'lesson',
        itemId: `l-${lesson.id}`,
        lessonId: lesson.id,
        sessionId: moduleSession.id,
        title: lesson.title,
        contentType: lesson.contentType,
        kind: lesson.kind,
        content: lesson.content,
        completed: index < completedCount,
        isNextInOrder: index === completedCount,
      });
    });

    for (const assignment of moduleSession.assignments) {
      const submission = assignment.submissions[0] ?? null;
      items.push({
        type: 'assignment',
        itemId: `a-${assignment.id}`,
        assignmentId: assignment.id,
        sessionId: moduleSession.id,
        instructions: assignment.instructions,
        submissionType: assignment.submissionType,
        dueDate: assignment.dueDate,
        isAdvancedMaterial: assignment.isAdvancedMaterial,
        submission: submission ? { content: submission.content, grade: submission.grade } : null,
        completed: Boolean(submission?.grade),
      });
    }
  }

  return {
    status: 'ok',
    data: {
      module: { id: module_.id, title: module_.title, description: module_.description },
      overallPercent,
      sessions: module_.sessions.map((moduleSession) => ({
        id: moduleSession.id,
        order: moduleSession.order,
        title: moduleSession.title,
      })),
      items,
    },
  };
}
