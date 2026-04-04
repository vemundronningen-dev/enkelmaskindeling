'use server';

import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function canManageProjects(role: UserRole) {
  return role === UserRole.ADMIN;
}

export async function createProject(formData: FormData) {
  const user = await requireUser();
  if (!canManageProjects(user.role)) return;

  const name = formData.get('name')?.toString().trim();
  const departmentId = formData.get('departmentId')?.toString() || null;
  const companyId = user.companyId;

  if (!name) return;

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

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      companyId: user.companyId
    }
  });
  if (!project) return;

  const department = departmentId
    ? await prisma.department.findFirst({ where: { id: departmentId, companyId: project.companyId } })
    : null;

  if (departmentId && !department) return;
  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      departmentId: department?.id ?? null
    }
  });

  await prisma.machine.updateMany({
    where: { projectId, companyId: user.companyId },
    data: { project: name }
  });

  revalidatePath('/projects');
  revalidatePath('/machines');
  revalidatePath('/admin');
}
