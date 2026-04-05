'use server';

import { Prisma, UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { hashPassword } from '@/lib/password';
import { ensureDatabaseSetup } from '@/lib/db-init';
import { prisma } from '@/lib/prisma';

type SignupField = 'companyName' | 'orgNumber' | 'adminName' | 'adminEmail' | 'password';

function withError(message: string, field?: SignupField): never {
  const params = new URLSearchParams({ error: message });
  if (field) {
    params.set('field', field);
  }

  redirect(`/signup-company?${params.toString()}#opprett-bedrift`);
}

export async function signupCompany(formData: FormData) {
  console.info('[signup-company] Incoming signup request');
  const companyName = formData.get('companyName')?.toString().trim() ?? '';
  const orgNumberRaw = formData.get('orgNumber')?.toString().trim() ?? '';
  const adminName = formData.get('adminName')?.toString().trim() ?? '';
  const adminEmail = formData.get('adminEmail')?.toString().trim().toLowerCase() ?? '';
  const password = formData.get('password')?.toString() ?? '';

  if (!companyName) {
    withError('Bedriftsnavn kan ikke være tomt.', 'companyName');
  }

  if (!adminName) {
    withError('Admin navn kan ikke være tomt.', 'adminName');
  }

  if (!adminEmail) {
    withError('E-post kan ikke være tom.', 'adminEmail');
  }

  if (!adminEmail.includes('@')) {
    withError('E-postadressen er ugyldig.', 'adminEmail');
  }

  if (!password) {
    withError('Passord kan ikke være tomt.', 'password');
  }

  if (password.length < 8) {
    withError('Passord må være minst 8 tegn.', 'password');
  }

  const orgNumber = orgNumberRaw || null;

  try {
    await ensureDatabaseSetup();

    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          orgNumber
        }
      });

      await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          passwordHash: await hashPassword(password),
          role: UserRole.ADMIN,
          companyId: company.id
        }
      });
    });
    console.info('[signup-company] Company and admin created successfully', { companyName, adminEmail });
  } catch (error) {
    console.error('[signup-company] Failed to create company', {
      companyName,
      orgNumber,
      adminEmail,
      error
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target) ? error.meta?.target.join(',') : String(error.meta?.target ?? '');

      if (target.includes('email')) {
        withError('E-post er allerede i bruk.', 'adminEmail');
      }

      if (target.includes('name')) {
        withError('Bedriftsnavn er allerede i bruk.', 'companyName');
      }

      if (target.includes('orgNumber')) {
        withError('Organisasjonsnummer er allerede i bruk.', 'orgNumber');
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      withError(`Databasefeil (${error.code}). Kunne ikke opprette bedrift.`);
    }

    if (error instanceof Error) {
      withError(error.message);
    }

    withError('Kunne ikke opprette bedrift. Prøv igjen.');
  }

  redirect('/login?success=Bedrift+og+admin+ble+opprettet.+Du+kan+logge+inn+nå');
}
