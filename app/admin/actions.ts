'use server';

import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

export async function createCompany(formData: FormData) {
  await requireAdmin();

  const name = formData.get('name')?.toString().trim();
  if (!name) return;

  await prisma.company.create({ data: { name } });
  revalidatePath('/admin');
}

export async function createDepartment(formData: FormData) {
  await requireAdmin();

  const name = formData.get('name')?.toString().trim();
  const companyId = formData.get('companyId')?.toString();
  if (!name || !companyId) return;

  await prisma.department.create({ data: { name, companyId } });
  revalidatePath('/admin');
}

export async function createProject(formData: FormData) {
  const user = await requireAdmin();

  const name = formData.get('name')?.toString().trim();
  const companyId = formData.get('companyId')?.toString();
  const departmentId = formData.get('departmentId')?.toString() || null;

  if (!name || !companyId) return;

  if (user.role === UserRole.COMPANY_ADMIN && user.companyId !== companyId) return;

  await prisma.project.create({
    data: {
      name,
      companyId,
      departmentId
    }
  });

  revalidatePath('/admin');
  revalidatePath('/machines');
}

export async function createManagedUser(formData: FormData) {
  const currentUser = await requireAdmin();

  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const phone = formData.get('phone')?.toString().trim() || null;
  const password = formData.get('password')?.toString();
  const role = formData.get('role')?.toString() as UserRole;
  const companyId = formData.get('companyId')?.toString();
  const departmentId = formData.get('departmentId')?.toString() || null;

  if (!name || !email || !password || !role || !companyId) return;
  if (currentUser.role === UserRole.COMPANY_ADMIN && currentUser.companyId !== companyId) return;

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      role,
      companyId,
      departmentId
    }
  });

  revalidatePath('/admin');
  revalidatePath('/users');
}
