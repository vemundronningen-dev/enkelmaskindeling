'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function createUser(formData: FormData) {
  const name = formData.get('name')?.toString();
  const email = formData.get('email')?.toString();
  const phone = formData.get('phone')?.toString();

  if (!name || !email || !phone) return;

  await prisma.user.create({
    data: {
      name,
      email,
      phone
    }
  });

  revalidatePath('/users');
  revalidatePath('/machines');
}
