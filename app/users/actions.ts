'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

export async function createUser(formData: FormData) {
  const currentUser = await requireAdmin();

  const name = formData.get('name')?.toString();
  const email = formData.get('email')?.toString().toLowerCase();
  const phone = formData.get('phone')?.toString() || null;
  const password = formData.get('password')?.toString() ?? 'Passord123!';

  if (!name || !email) return;

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      companyId: currentUser.companyId
    }

    throw error;
  }

  revalidatePath('/users');
  revalidatePath('/machines');
  redirect('/users?success=Bruker+opprettet');
}
