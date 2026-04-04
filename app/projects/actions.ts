'use server';

import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function canManageProjects(role: UserRole) {
  return role === UserRole.SUPERADMIN || role === UserRole.COMPANY_ADMIN || role === UserRole.DEPARTMENT_MANAGER;
}

export async function createProject(formData: FormData) {
  const user = await requireUser();
  if (!canManageProjects(user.role)) return;

  const name = formData.get('name')?.toString().trim();
  const companyId = formData.get('companyId')?.toString();
  const departmentId = formData.get('departmentId')?.toString() || null;

  if (!name || !companyId) return;

  if (user.role !== UserRole.SUPERADMIN && user.companyId !== companyId) return;
  if (user.role === UserRole.DEPARTMENT_MANAGER && user.departmentId !== departmentId) return;

  const department = departmentId
    ? await prisma.department.findFirst({ where: { id: departmentId, companyId } })
    : null;

  if (departmentId && !department) return;

  await prisma.project.create({
    data: {
      name,
      companyId,
      departmentId: department?.id ?? null
    }
  });

  revalidatePath('/projects');
  revalidatePath('/machines');
  revalidatePath('/admin');
}

export async function updateProject(formData: FormData) {
  const user = await requireUser();
  if (!canManageProjects(user.role)) return;

  const projectId = formData.get('projectId')?.toString();
  const name = formData.get('name')?.toString().trim();
  const departmentId = formData.get('departmentId')?.toString() || null;

  if (!projectId || !name) return;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  if (user.role !== UserRole.SUPERADMIN && user.companyId !== project.companyId) return;
  if (user.role === UserRole.DEPARTMENT_MANAGER && user.departmentId !== project.departmentId) return;

  const department = departmentId
    ? await prisma.department.findFirst({ where: { id: departmentId, companyId: project.companyId } })
    : null;

  if (departmentId && !department) return;
  if (user.role === UserRole.DEPARTMENT_MANAGER && user.departmentId !== (department?.id ?? null)) return;

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      departmentId: department?.id ?? null
    }
  });

  await prisma.machine.updateMany({
    where: { projectId },
    data: { project: name }
  });

  revalidatePath('/projects');
  revalidatePath('/machines');
  revalidatePath('/admin');
}
