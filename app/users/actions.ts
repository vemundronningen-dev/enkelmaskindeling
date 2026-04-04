'use server';

import { Prisma, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

function withError(message: string) {
  redirect(`/users?error=${encodeURIComponent(message)}`);
}

export async function createUser(formData: FormData) {
  const currentUser = await requireAdmin();

  if (!currentUser.companyId) {
    withError('Du må være knyttet til en bedrift for å opprette brukere.');
  }

  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString() ?? '';
  const roleValue = formData.get('role')?.toString();

  if (!name) {
    withError('Navn er påkrevd.');
  }

  if (!email) {
    withError('E-post er påkrevd.');
  }

  if (!password) {
    withError('Passord er påkrevd.');
  }

  const role = roleValue === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        role,
        companyId: currentUser.companyId
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      withError('E-postadressen er allerede i bruk.');
    }

    withError('Kunne ikke opprette bruker. Prøv igjen.');
  }

  revalidatePath('/users');
  revalidatePath('/machines');
  redirect('/users?success=Bruker+opprettet');
}
