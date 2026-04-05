'use server';

import { Prisma, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin, requireUser } from '@/lib/auth';
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

function sanitizePhoneNumber(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue;
}

function isValidPhoneNumber(value: string) {
  return /^[+\d][\d\s()-]{5,19}$/.test(value);
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

export async function updateUser(formData: FormData) {
  const currentUser = await requireUser();
  const userId = formData.get('userId');

  if (typeof userId !== 'string' || !userId.trim()) {
    redirect('/users?error=Mangler+brukeridentifikator.');
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      id: userId,
      companyId: currentUser.companyId
    },
    select: {
      id: true,
      role: true
    }
  });

  if (!targetUser) {
    redirect('/users?error=Fant+ikke+brukeren+du+vil+oppdatere.');
  }

  if (currentUser.role !== UserRole.ADMIN && currentUser.id !== targetUser.id) {
    redirect('/users?error=Du+har+ikke+tilgang+til+å+redigere+denne+brukeren.');
  }

  const name = requireNonEmptyField(formData, 'name', 'Skriv inn et navn for brukeren.');
  const email = requireNonEmptyField(formData, 'email', 'Skriv inn en e-postadresse.').toLowerCase();
  const phoneInput = formData.get('phone');
  const phoneValue = typeof phoneInput === 'string' ? sanitizePhoneNumber(phoneInput) : null;

  if (!email.includes('@')) {
    redirect(`/users?error=${encodeURIComponent('E-postadressen må inneholde @.')}`);
  }

  if (phoneValue && !isValidPhoneNumber(phoneValue)) {
    redirect(`/users?error=${encodeURIComponent('Telefonnummer må være gyldig (kun tall og vanlige tegn).')}`);
  }

  const requestedRole = formData.get('role');
  const role =
    currentUser.role === UserRole.ADMIN && requestedRole === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;

  try {
    await prisma.user.update({
      where: {
        id: targetUser.id
      },
      data: {
        name,
        email,
        phone: phoneValue,
        role: currentUser.role === UserRole.ADMIN ? role : targetUser.role
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      redirect(`/users?error=${encodeURIComponent('E-postadressen er allerede i bruk.')}`);
    }

    redirect(`/users?error=${encodeURIComponent('Kunne ikke oppdatere bruker. Prøv igjen.')}`);
  }

  revalidatePath('/users');
  revalidatePath('/machines');
  redirect('/users?success=Brukeren+ble+oppdatert');
}
