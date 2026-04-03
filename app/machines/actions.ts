'use server';

import { MachineStatus, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function scopedMachineWhere(user: Awaited<ReturnType<typeof requireUser>>) {
  if (user.role === UserRole.SUPERADMIN) return {};

  return {
    projectRef: {
      companyId: user.companyId ?? undefined,
      ...(user.role === UserRole.DEPARTMENT_MANAGER && user.departmentId ? { departmentId: user.departmentId } : {})
    }
  };
}

export async function updateResponsibleUser(formData: FormData) {
  const user = await requireUser();
  const machineId = formData.get('machineId')?.toString();
  const userId = formData.get('userId')?.toString() || null;

  if (!machineId) return;

  const machine = await prisma.machine.findFirst({ where: { id: machineId, ...scopedMachineWhere(user) } });
  if (!machine) return;

  const nextStatus = userId ? MachineStatus.TILDELT : MachineStatus.LEDIG;

  await prisma.machine.update({
    where: { id: machineId },
    data: {
      responsibleUserId: userId,
      status: nextStatus
    }
  });

  revalidatePath('/machines');
  revalidatePath('/available');
  revalidatePath('/users');
}

export async function updateMachine(formData: FormData) {
  const user = await requireUser();
  const machineId = formData.get('machineId')?.toString();
  const name = formData.get('name')?.toString();
  const machineNumber = formData.get('machineNumber')?.toString();
  const type = formData.get('type')?.toString();
  const projectId = formData.get('projectId')?.toString();
  const status = formData.get('status')?.toString() as MachineStatus;

  if (!machineId || !name || !machineNumber || !type || !projectId || !status) return;

  const existing = await prisma.machine.findFirst({ where: { id: machineId, ...scopedMachineWhere(user) } });
  if (!existing) return;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const safeStatus = existing.responsibleUserId && status === MachineStatus.LEDIG ? MachineStatus.TILDELT : status;

  await prisma.machine.update({
    where: { id: machineId },
    data: {
      name,
      machineNumber,
      type,
      projectId,
      project: project.name,
      status: safeStatus
    }
  });

  revalidatePath('/machines');
  revalidatePath('/available');
  revalidatePath('/users');
}

export async function createMachine(formData: FormData) {
  await requireUser();

  const name = formData.get('name')?.toString();
  const machineNumber = formData.get('machineNumber')?.toString();
  const type = formData.get('type')?.toString();
  const projectId = formData.get('projectId')?.toString();

  if (!name || !machineNumber || !type || !projectId) return;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  await prisma.machine.create({
    data: {
      name,
      machineNumber,
      type,
      projectId,
      project: project.name,
      status: MachineStatus.LEDIG
    }
  });

  revalidatePath('/machines');
  revalidatePath('/available');
}
