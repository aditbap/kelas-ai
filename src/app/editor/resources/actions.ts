'use server';

import { revalidatePath } from 'next/cache';

import { ResourceType, Role } from '@/generated/prisma/client/enums';
import { logAudit } from '@/lib/audit';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

import type { ActionState } from '@/lib/actions';
export type { ActionState };

export async function createResourceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Editor);

  const type = String(formData.get('type') ?? '') as ResourceType;
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!title || !content || !Object.values(ResourceType).includes(type)) {
    return { error: 'Give the resource a type, title, and content.' };
  }

  const resource = await prisma.resourceItem.create({ data: { type, title, content, tags } });
  await logAudit({
    actorId: session.userId,
    action: 'resource.create',
    targetType: 'ResourceItem',
    targetId: resource.id,
  });

  revalidatePath('/editor/resources');
  return { success: `Published "${title}".` };
}
