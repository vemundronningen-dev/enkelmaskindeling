import { BookingStatus, MachineStatus, PrismaClient } from '@prisma/client';

export function calculateBookingStatus(startAt: Date, endAt: Date, now = new Date()): BookingStatus {
  if (endAt <= now) return BookingStatus.FULLFORT;
  if (startAt <= now && endAt > now) return BookingStatus.AKTIV;
  return BookingStatus.PLANLAGT;
}

export async function syncMachineStatus(prisma: PrismaClient, machineId: string) {
  const now = new Date();
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    select: {
      id: true,
      status: true,
      manualOverrideStatus: true,
      bookings: {
        where: {
          status: {
            in: [BookingStatus.PLANLAGT, BookingStatus.AKTIV]
          }
        },
        orderBy: { startAt: 'asc' },
        select: { startAt: true, endAt: true }
      }
    }
  });

  if (!machine) return;

  const previous = machine.status;
  let nextStatus: MachineStatus = MachineStatus.LEDIG;

  if (machine.manualOverrideStatus) {
    nextStatus = machine.manualOverrideStatus;
  } else {
    const active = machine.bookings.find((booking) => booking.startAt <= now && booking.endAt > now);
    const upcoming = machine.bookings.find((booking) => booking.startAt > now);

    if (active) {
      nextStatus = MachineStatus.I_BRUK;
    } else if (upcoming) {
      nextStatus = MachineStatus.BOOKET;
    }
  }

  if (nextStatus !== previous) {
    await prisma.machine.update({ where: { id: machineId }, data: { status: nextStatus } });
  }
}

export function validateInterval(startAt: Date, endAt: Date) {
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    throw new Error('Ugyldig datoformat.');
  }

  if (endAt <= startAt) {
    throw new Error('Til-dato må være senere enn fra-dato.');
  }
}
