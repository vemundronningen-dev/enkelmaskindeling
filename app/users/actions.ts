'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { ensureUserPasswordHashColumn } from '@/lib/db-compat';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

export async function createUser(formData: FormData) {
  const currentUser = await requireAdmin();
  await ensureUserPasswordHashColumn();

  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const phone = formData.get('phone')?.toString().trim() || null;
  const password = formData.get('password')?.toString() ?? '';

  if (!name || !email || !password.trim()) {
    redirect('/users?error=Navn,+e-post+og+passord+må+fylles+ut');
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashPassword(password),
        companyId: currentUser.companyId
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      redirect('/users?error=E-post+finnes+allerede');
    }

    throw error;
  }

  revalidatePath('/users');
  revalidatePath('/machines');
  redirect('/users?success=Bruker+opprettet');
}
