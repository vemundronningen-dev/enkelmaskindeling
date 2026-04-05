'use server';

import { MachineStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const UNASSIGNED_PROJECT_LABEL = 'Ikke tilknyttet prosjekt';

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
  const projectId = formData.get('projectId')?.toString() || null;
  const status = formData.get('status')?.toString() as MachineStatus;

  if (!machineId || !name || !machineNumber || !type || !status) return;

  const existing = await prisma.machine.findFirst({ where: { id: machineId, ...scopedMachineWhere(user) } });
  if (!existing) return;

  let nextProjectId: string | null = null;
  let nextProjectName = UNASSIGNED_PROJECT_LABEL;

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId: user.companyId }
    });
    if (!project) return;
    nextProjectId = project.id;
    nextProjectName = project.name;
  }

  const safeStatus = existing.responsibleUserId && status === MachineStatus.LEDIG ? MachineStatus.TILDELT : status;

  await prisma.machine.update({
    where: { id: machineId },
    data: {
      name,
      machineNumber,
      type,
      projectId: nextProjectId,
      project: nextProjectName,
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
  const projectId = formData.get('projectId')?.toString() || null;

  if (!machineId) return;

  const machine = await prisma.machine.findFirst({ where: { id: machineId, ...scopedMachineWhere(user) } });
  if (!machine) return;

  if (!projectId) {
    await prisma.machine.update({
      where: { id: machineId },
      data: {
        projectId: null,
        project: UNASSIGNED_PROJECT_LABEL
      }
    });

    revalidatePath('/machines');
    revalidatePath('/projects');
    revalidatePath('/available');
    return;
  }

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
  const projectId = formData.get('projectId')?.toString() || null;

  if (!name || !machineNumber || !type) return;

  let nextProjectId: string | null = null;
  let nextProjectName = UNASSIGNED_PROJECT_LABEL;

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId: user.companyId }
    });
    if (!project) return;
    nextProjectId = project.id;
    nextProjectName = project.name;
  }

  await prisma.machine.create({
    data: {
      name,
      machineNumber,
      type,
      companyId: user.companyId,
      projectId: nextProjectId,
      project: nextProjectName,
      status: MachineStatus.LEDIG
    }
  });

  revalidatePath('/machines');
  revalidatePath('/available');
}
