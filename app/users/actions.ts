'use server';

import { revalidatePath } from 'next/cache';
import { ensureDatabaseSetup } from '@/lib/db-init';
import { prisma } from '@/lib/prisma';

export async function createUser(formData: FormData) {
  await ensureDatabaseSetup();

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

export async function updateUser(formData: FormData) {
  await ensureDatabaseSetup();

  const userId = formData.get('userId')?.toString();
  const name = formData.get('name')?.toString();
  const email = formData.get('email')?.toString();
  const phone = formData.get('phone')?.toString();

  if (!userId || !name || !email || !phone) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      phone
    }
  });

  revalidatePath('/users');
  revalidatePath('/machines');
}
