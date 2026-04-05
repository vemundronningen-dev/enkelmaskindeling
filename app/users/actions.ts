'use server';

import { Prisma, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

function withError(message: string, field?: 'name' | 'email' | 'password'): never {
  const params = new URLSearchParams({ error: message });
  if (field) {
    params.set('field', field);
  }
  redirect(`/users?${params.toString()}#opprett-bruker`);
}

function requireNonEmptyField(formData: FormData, field: 'name' | 'email' | 'password', errorMessage: string) {
  const value = formData.get(field);

  if (typeof value !== 'string') {
    withError(errorMessage, field);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    withError(errorMessage, field);
  }

  return normalizedValue;
}

export async function createUser(formData: FormData) {
  const currentUser = await requireAdmin();

  if (!currentUser.companyId) {
    withError('Du må være knyttet til en bedrift for å opprette brukere.');
  }

  const name = requireNonEmptyField(formData, 'name', 'Skriv inn et navn for brukeren.');
  const email = requireNonEmptyField(formData, 'email', 'Skriv inn en e-postadresse.').toLowerCase();
  const password = requireNonEmptyField(formData, 'password', 'Skriv inn et passord.');
  const roleInput = formData.get('role');
  const role = roleInput === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;

  if (!email.includes('@')) {
    withError('E-postadressen må inneholde @.', 'email');
  }

  if (password.length < 8) {
    withError('Passord må være minst 8 tegn.', 'password');
  }

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
      withError('E-postadressen er allerede i bruk.', 'email');
    }

    withError('Kunne ikke opprette bruker. Prøv igjen.');
  }

  revalidatePath('/users');
  revalidatePath('/machines');
  redirect('/users?success=Brukeren+ble+opprettet#opprett-bruker');
}
