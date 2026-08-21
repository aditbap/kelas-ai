'use server';

import { revalidatePath } from 'next/cache';

import { ResourceType, Role } from '@/generated/prisma/client/enums';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/session';

export type ActionState = { error?: string; success?: string };

export async function createResourceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(Role.Instructor);

  const type = String(formData.get('type') ?? '') as ResourceType;
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const visibility = String(formData.get('visibility') ?? '');

  if (!title || !content || !Object.values(ResourceType).includes(type)) {
    return { error: 'Give the resource a type, title, and content.' };
  }

  let tenantId: string | null = null;
  let isGlobal = false;
  if (visibility === 'global') {
    isGlobal = true;
  } else {
    const assignment = await prisma.instructorTenantAssignment.findUnique({
      where: { instructorId_tenantId: { instructorId: session.userId, tenantId: visibility } },
    });
    if (!assignment) return { error: 'Pick a valid tenant or Global.' };
    tenantId = visibility;
  }

  await prisma.resourceItem.create({ data: { type, title, content, tags, isGlobal, tenantId } });

  revalidatePath('/instructor/resources');
  return { success: `Published "${title}".` };
}
