'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function createUser(formData: FormData) {
  const name = formData.get('name')?.toString();
  const email = formData.get('email')?.toString();

  if (!name || !email) return;

  await prisma.user.create({
    data: {
      name,
      email
    }
  });

  revalidatePath('/users');
  revalidatePath('/machines');
}
