'use server';

import { BookingStatus, MachineStatus, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateBookingStatus, syncMachineStatus, validateInterval } from '@/lib/machine-booking';

async function getMachine(machineId: string, companyId: string) {
  return prisma.machine.findFirst({ where: { id: machineId, companyId }, select: { id: true, companyId: true } });
}

async function ensureNoOverlap(machineId: string, startAt: Date, endAt: Date, bookingId?: string, allowConflict = false) {
  if (allowConflict) return;

  const overlapping = await prisma.machineBooking.findFirst({
    where: {
      machineId,
      id: bookingId ? { not: bookingId } : undefined,
      status: { not: BookingStatus.KANSELLERT },
      startAt: { lt: endAt },
      endAt: { gt: startAt }
    },
    select: { id: true }
  });

  if (overlapping) {
    throw new Error('Maskinen er allerede booket i valgt tidsrom.');
  }
}

export async function createBooking(formData: FormData) {
  const user = await requireUser();

  const machineId = formData.get('machineId')?.toString();
  const projectId = formData.get('projectId')?.toString() || null;
  const location = formData.get('location')?.toString();
  const startAtRaw = formData.get('startAt')?.toString();
  const endAtRaw = formData.get('endAt')?.toString();
  const responsibleUserId = formData.get('responsibleUserId')?.toString();
  const companyName = formData.get('companyName')?.toString() || null;
  const comment = formData.get('comment')?.toString() || null;
  const allowConflict = formData.get('allowConflict')?.toString() === '1';

  if (!machineId || !location || !startAtRaw || !endAtRaw || !responsibleUserId) return;

  const machine = await getMachine(machineId, user.companyId);
  if (!machine) return;

  const [responsibleUser, project] = await Promise.all([
    prisma.user.findFirst({ where: { id: responsibleUserId, companyId: user.companyId }, select: { id: true } }),
    projectId ? prisma.project.findFirst({ where: { id: projectId, companyId: user.companyId }, select: { id: true } }) : Promise.resolve(null)
  ]);

  if (!responsibleUser || (projectId && !project)) return;

  const startAt = new Date(startAtRaw);
  const endAt = new Date(endAtRaw);
  validateInterval(startAt, endAt);

  await ensureNoOverlap(machineId, startAt, endAt, undefined, allowConflict && user.role === UserRole.ADMIN);

  await prisma.$transaction(async (tx) => {
    const booking = await tx.machineBooking.create({
      data: {
        machineId,
        companyId: user.companyId,
        projectId,
        location,
        startAt,
        endAt,
        responsibleUserId,
        companyName,
        comment,
        status: calculateBookingStatus(startAt, endAt),
        createdById: user.id,
        updatedById: user.id
      }
    });

    await tx.machineLocationHistory.create({
      data: {
        machineId,
        companyId: user.companyId,
        bookingId: booking.id,
        projectId,
        location,
        responsibleUserId,
        note: `Booking opprettet${comment ? `: ${comment}` : ''}`,
        createdById: user.id
      }
    });
  });

  await syncMachineStatus(prisma, machineId);

  revalidatePath('/machines');
  revalidatePath(`/machines/${machineId}`);
  revalidatePath('/planner');
}

export async function updateBooking(formData: FormData) {
  const user = await requireUser();

  const bookingId = formData.get('bookingId')?.toString();
  const machineId = formData.get('machineId')?.toString();
  const projectId = formData.get('projectId')?.toString() || null;
  const location = formData.get('location')?.toString();
  const startAtRaw = formData.get('startAt')?.toString();
  const endAtRaw = formData.get('endAt')?.toString();
  const responsibleUserId = formData.get('responsibleUserId')?.toString();
  const companyName = formData.get('companyName')?.toString() || null;
  const comment = formData.get('comment')?.toString() || null;
  const allowConflict = formData.get('allowConflict')?.toString() === '1';

  if (!bookingId || !machineId || !location || !startAtRaw || !endAtRaw || !responsibleUserId) return;

  const booking = await prisma.machineBooking.findFirst({ where: { id: bookingId, machineId, companyId: user.companyId } });
  if (!booking) return;

  if (user.role !== UserRole.ADMIN && booking.createdById !== user.id) {
    throw new Error('Du har ikke tilgang til å endre denne bookingen.');
  }

  const startAt = new Date(startAtRaw);
  const endAt = new Date(endAtRaw);
  validateInterval(startAt, endAt);

  await ensureNoOverlap(machineId, startAt, endAt, bookingId, allowConflict && user.role === UserRole.ADMIN);

  await prisma.$transaction(async (tx) => {
    await tx.machineBooking.update({
      where: { id: bookingId },
      data: {
        projectId,
        location,
        startAt,
        endAt,
        responsibleUserId,
        companyName,
        comment,
        status: calculateBookingStatus(startAt, endAt),
        updatedById: user.id
      }
    });

    await tx.machineLocationHistory.create({
      data: {
        machineId,
        companyId: user.companyId,
        bookingId,
        projectId,
        location,
        responsibleUserId,
        note: 'Booking oppdatert',
        createdById: user.id
      }
    });
  });

  await syncMachineStatus(prisma, machineId);

  revalidatePath(`/machines/${machineId}`);
  revalidatePath('/planner');
}

export async function cancelBooking(formData: FormData) {
  const user = await requireUser();
  const bookingId = formData.get('bookingId')?.toString();
  const machineId = formData.get('machineId')?.toString();
  if (!bookingId || !machineId) return;

  const booking = await prisma.machineBooking.findFirst({ where: { id: bookingId, machineId, companyId: user.companyId } });
  if (!booking) return;
  if (user.role !== UserRole.ADMIN && booking.createdById !== user.id) {
    throw new Error('Du har ikke tilgang til å kansellere denne bookingen.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.machineBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.KANSELLERT,
        cancelledAt: new Date(),
        cancelledById: user.id,
        updatedById: user.id
      }
    });

    await tx.machineStatusLog.create({
      data: {
        machineId,
        companyId: user.companyId,
        fromStatus: null,
        toStatus: MachineStatus.BOOKET,
        source: 'BOOKING_CANCELLATION',
        note: `Booking ${bookingId} kansellert`,
        createdById: user.id
      }
    });
  });

  await syncMachineStatus(prisma, machineId);

  revalidatePath(`/machines/${machineId}`);
  revalidatePath('/planner');
}

export async function setManualMachineStatus(formData: FormData) {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN) {
    throw new Error('Kun admin kan overstyre status.');
  }

  const machineId = formData.get('machineId')?.toString();
  const statusRaw = formData.get('status')?.toString();
  const reason = formData.get('reason')?.toString() || null;

  if (!machineId || !statusRaw) return;

  const machine = await prisma.machine.findFirst({ where: { id: machineId, companyId: user.companyId } });
  if (!machine) return;

  const status = statusRaw === 'AUTO' ? null : (statusRaw as MachineStatus);

  await prisma.$transaction(async (tx) => {
    await tx.machine.update({
      where: { id: machineId },
      data: {
        manualOverrideStatus: status,
        manualOverrideReason: reason
      }
    });

    await tx.machineStatusLog.create({
      data: {
        machineId,
        companyId: user.companyId,
        fromStatus: machine.status,
        toStatus: status ?? machine.status,
        source: status ? 'MANUAL_OVERRIDE' : 'MANUAL_OVERRIDE_CLEARED',
        note: reason,
        createdById: user.id
      }
    });
  });

  await syncMachineStatus(prisma, machineId);

  revalidatePath('/machines');
  revalidatePath(`/machines/${machineId}`);
  revalidatePath('/planner');
}
