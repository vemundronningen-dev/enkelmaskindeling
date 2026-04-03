'use server';

import { MachineStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function updateResponsibleUser(formData: FormData) {
  const machineId = formData.get('machineId')?.toString();
  const userId = formData.get('userId')?.toString() || null;

  if (!machineId) return;

  const machine = await prisma.machine.findUnique({ where: { id: machineId } });
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
  const machineId = formData.get('machineId')?.toString();
  const name = formData.get('name')?.toString();
  const machineNumber = formData.get('machineNumber')?.toString();
  const type = formData.get('type')?.toString();
  const project = formData.get('project')?.toString();
  const status = formData.get('status')?.toString() as MachineStatus;

  if (!machineId || !name || !machineNumber || !type || !project || !status) return;

  const existing = await prisma.machine.findUnique({ where: { id: machineId } });
  if (!existing) return;

  const safeStatus = existing.responsibleUserId && status === MachineStatus.LEDIG ? MachineStatus.TILDELT : status;

  await prisma.machine.update({
    where: { id: machineId },
    data: {
      name,
      machineNumber,
      type,
      project,
      status: safeStatus
    }
  });

  revalidatePath('/machines');
  revalidatePath('/available');
  revalidatePath('/users');
}

export async function createMachine(formData: FormData) {
  const name = formData.get('name')?.toString();
  const machineNumber = formData.get('machineNumber')?.toString();
  const type = formData.get('type')?.toString();
  const project = formData.get('project')?.toString();

  if (!name || !machineNumber || !type || !project) return;

  await prisma.machine.create({
    data: {
      name,
      machineNumber,
      type,
      project,
      status: MachineStatus.LEDIG
    }
  });

  revalidatePath('/machines');
  revalidatePath('/available');
}
