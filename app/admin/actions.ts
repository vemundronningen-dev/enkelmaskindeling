'use server';

import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

export async function createCompany(formData: FormData) {
  void formData;
  return;
}

export async function createDepartment(formData: FormData) {
  const user = await requireAdmin();

  const name = formData.get('name')?.toString().trim();
  const companyId = formData.get('companyId')?.toString();
  if (!name || !companyId) return;
  if (companyId !== user.companyId) return;

  await prisma.department.create({ data: { name, companyId } });
  revalidatePath('/admin');
}

export async function createProject(formData: FormData) {
  const user = await requireAdmin();

  const name = formData.get('name')?.toString().trim();
  const companyId = formData.get('companyId')?.toString();
  const departmentId = formData.get('departmentId')?.toString() || null;

  if (!name || !companyId) return;

  if (user.companyId !== companyId) return;

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
  if (currentUser.companyId !== companyId) return;
  if (role !== UserRole.ADMIN && role !== UserRole.USER) return;

  if (departmentId) {
    const department = await prisma.department.findFirst({ where: { id: departmentId, companyId: currentUser.companyId } });
    if (!department) return;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
      role,
      companyId,
      departmentId
    }
  });

  revalidatePath('/admin');
  revalidatePath('/users');
}
