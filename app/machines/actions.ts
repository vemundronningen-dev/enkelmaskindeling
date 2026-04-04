'use server';

import { MachineStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function scopedMachineWhere(user: Awaited<ReturnType<typeof requireUser>>) {
  return {
    companyId: user.companyId
  };
}

export async function updateResponsibleUser(formData: FormData) {
  const user = await requireUser();
  const machineId = formData.get('machineId')?.toString();
  const userId = formData.get('userId')?.toString() || null;

  if (!machineId) return;

  const machine = await prisma.machine.findFirst({ where: { id: machineId, ...scopedMachineWhere(user) } });
  if (!machine) return;
  if (userId) {
    const responsibleUser = await prisma.user.findFirst({ where: { id: userId, companyId: user.companyId } });
    if (!responsibleUser) return;
  }

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

  const project = await prisma.project.findFirst({
    where: { id: projectId, companyId: user.companyId }
  });
  if (!project) return;

  const safeStatus = existing.responsibleUserId && status === MachineStatus.LEDIG ? MachineStatus.TILDELT : status;

  await prisma.machine.update({
    where: { id: machineId },
    data: {
      name,
      machineNumber,
      type,
      companyId: project.companyId,
      projectId,
      project: project.name,
      status: safeStatus
    }
  });

  revalidatePath('/machines');
  revalidatePath('/available');
  revalidatePath('/users');
}


export async function updateMachineProject(formData: FormData) {
  const user = await requireUser();
  const machineId = formData.get('machineId')?.toString();
  const projectId = formData.get('projectId')?.toString();

  if (!machineId || !projectId) return;

  const machine = await prisma.machine.findFirst({ where: { id: machineId, ...scopedMachineWhere(user) } });
  if (!machine) return;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      companyId: user.companyId
    }
  });

  if (!project) return;

  await prisma.machine.update({
    where: { id: machineId },
    data: {
      companyId: project.companyId,
      projectId: project.id,
      project: project.name
    }
  });

  revalidatePath('/machines');
  revalidatePath('/projects');
  revalidatePath('/available');
}
export async function createMachine(formData: FormData) {
  const user = await requireUser();

  const name = formData.get('name')?.toString();
  const machineNumber = formData.get('machineNumber')?.toString();
  const type = formData.get('type')?.toString();
  const projectId = formData.get('projectId')?.toString();

  if (!name || !machineNumber || !type || !projectId) return;

  const project = await prisma.project.findFirst({
    where: { id: projectId, companyId: user.companyId }
  });
  if (!project) return;

  await prisma.machine.create({
    data: {
      name,
      machineNumber,
      type,
      companyId: project.companyId,
      projectId,
      project: project.name,
      status: MachineStatus.LEDIG
    }
  });

  revalidatePath('/machines');
  revalidatePath('/available');
}
