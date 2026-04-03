'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function createProject(formData: FormData) {
  const name = formData.get('name')?.toString().trim();

  if (!name) return;

  await prisma.project.upsert({
    where: { name },
    update: {},
    create: { name }
  });

  revalidatePath('/projects');
  revalidatePath('/machines');
}
