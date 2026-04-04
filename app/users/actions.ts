'use server';

import { Prisma, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

function withError(message: string): never {
  redirect(`/users?error=${encodeURIComponent(message)}`);
}

function requireNonEmptyField(formData: FormData, field: string, errorMessage: string) {
  const value = formData.get(field);

  if (typeof value !== 'string') {
    withError(errorMessage);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    withError(errorMessage);
  }

  return normalizedValue;
}

export async function createUser(formData: FormData) {
  const currentUser = await requireAdmin();

  if (!currentUser.companyId) {
    withError('Du må være knyttet til en bedrift for å opprette brukere.');
  }

  const name = requireNonEmptyField(formData, 'name', 'Navn er påkrevd.');
  const email = requireNonEmptyField(formData, 'email', 'E-post er påkrevd.').toLowerCase();
  const password = requireNonEmptyField(formData, 'password', 'Passord er påkrevd.');
  const roleInput = formData.get('role');
  const role = roleInput === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
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
