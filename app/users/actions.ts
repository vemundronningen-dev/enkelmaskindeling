'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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
  if (!currentUser.companyId) return;

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      companyId: currentUser.companyId
    }
  });

  revalidatePath('/users');
  revalidatePath('/machines');
  redirect('/users?success=Bruker+opprettet');
}
