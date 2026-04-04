'use server';

import { Prisma, UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

function toQueryError(message: string) {
  return encodeURIComponent(message);
}

export async function signupCompany(formData: FormData) {
  const companyName = formData.get('companyName')?.toString().trim() ?? '';
  const orgNumberRaw = formData.get('orgNumber')?.toString().trim() ?? '';
  const adminName = formData.get('adminName')?.toString().trim() ?? '';
  const adminEmail = formData.get('adminEmail')?.toString().trim().toLowerCase() ?? '';
  const password = formData.get('password')?.toString() ?? '';

  if (!companyName) {
    redirect(`/signup-company?error=${toQueryError('Bedriftsnavn kan ikke være tomt')}`);
  }

  if (!adminName) {
    redirect(`/signup-company?error=${toQueryError('Admin navn kan ikke være tomt')}`);
  }

  if (!adminEmail) {
    redirect(`/signup-company?error=${toQueryError('E-post kan ikke være tom')}`);
  }

  if (!password) {
    redirect(`/signup-company?error=${toQueryError('Passord kan ikke være tomt')}`);
  }

  const orgNumber = orgNumberRaw || null;

  try {
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target) ? error.meta?.target.join(',') : String(error.meta?.target ?? '');

      if (target.includes('email')) {
        redirect(`/signup-company?error=${toQueryError('E-post er allerede i bruk')}`);
      }

      if (target.includes('name')) {
        redirect(`/signup-company?error=${toQueryError('Bedriftsnavn er allerede i bruk')}`);
      }

      if (target.includes('orgNumber')) {
        redirect(`/signup-company?error=${toQueryError('Organisasjonsnummer er allerede i bruk')}`);
      }
    }

    redirect(`/signup-company?error=${toQueryError('Kunne ikke opprette bedrift. Prøv igjen.')}`);
  }

  redirect('/login?success=Bedrift+og+admin+ble+opprettet.+Du+kan+logge+inn+nå');
}
