'use server';

import { redirect } from 'next/navigation';
import { verifyPassword } from '@/lib/password';
import { createSession, destroySession } from '@/lib/auth';
import { ensureUserPasswordHashColumn } from '@/lib/db-compat';
import { prisma } from '@/lib/prisma';

export async function login(formData: FormData) {
  await ensureUserPasswordHashColumn();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString() ?? '';

  if (!email || !password) {
    redirect('/login?error=Mangler+epost+eller+passord');
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect('/login?error=Ugyldig+epost+eller+passord');
  }

  await createSession(user.id);
  redirect('/machines');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
