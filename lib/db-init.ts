import { MachineStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function ensureDatabaseSetup() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MachineStatus') THEN
        CREATE TYPE "MachineStatus" AS ENUM ('LEDIG', 'TILDELT', 'SERVICE');
      END IF;
    END
    $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Machine" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "machineNumber" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "project" TEXT NOT NULL,
      "status" "MachineStatus" NOT NULL DEFAULT 'LEDIG',
      "responsibleUserId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Machine_machineNumber_key" ON "Machine"("machineNumber");
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'Machine_responsibleUserId_fkey'
          AND table_name = 'Machine'
      ) THEN
        ALTER TABLE "Machine"
        ADD CONSTRAINT "Machine_responsibleUserId_fkey"
        FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END
    $$;
  `);

  const userCount = await prisma.user.count();
  const machineCount = await prisma.machine.count();

  let seeded = false;

  if (userCount === 0) {
    await prisma.user.createMany({
      data: [
        { name: 'Ola Nordmann', email: 'ola@example.com' },
        { name: 'Kari Hansen', email: 'kari@example.com' },
        { name: 'Per Olsen', email: 'per@example.com' },
        { name: 'Anne Nilsen', email: 'anne@example.com' },
        { name: 'Mina Johansen', email: 'mina@example.com' }
      ]
    });
    seeded = true;
  }

  if (machineCount === 0) {
    await prisma.machine.createMany({
      data: [
        { name: 'Gravemaskin A', machineNumber: 'M-1001', type: 'Gravemaskin', project: 'E6 Nord', status: MachineStatus.LEDIG },
        { name: 'Gravemaskin B', machineNumber: 'M-1002', type: 'Gravemaskin', project: 'E6 Nord', status: MachineStatus.SERVICE },
        { name: 'Hjullaster 1', machineNumber: 'M-1003', type: 'Hjullaster', project: 'Havn Vest', status: MachineStatus.LEDIG },
        { name: 'Hjullaster 2', machineNumber: 'M-1004', type: 'Hjullaster', project: 'Havn Vest', status: MachineStatus.LEDIG },
        { name: 'Dumper 1', machineNumber: 'M-1005', type: 'Dumper', project: 'Tunnel Sør', status: MachineStatus.SERVICE },
        { name: 'Dumper 2', machineNumber: 'M-1006', type: 'Dumper', project: 'Tunnel Sør', status: MachineStatus.LEDIG },
        { name: 'Vals 1', machineNumber: 'M-1007', type: 'Vals', project: 'Asfalt Øst', status: MachineStatus.LEDIG },
        { name: 'Vals 2', machineNumber: 'M-1008', type: 'Vals', project: 'Asfalt Øst', status: MachineStatus.LEDIG },
        { name: 'Kran 1', machineNumber: 'M-1009', type: 'Kran', project: 'Bygg Sentrum', status: MachineStatus.SERVICE },
        { name: 'Kran 2', machineNumber: 'M-1010', type: 'Kran', project: 'Bygg Sentrum', status: MachineStatus.LEDIG },
        { name: 'Lift 1', machineNumber: 'M-1011', type: 'Lift', project: 'Skole Vest', status: MachineStatus.LEDIG },
        { name: 'Lift 2', machineNumber: 'M-1012', type: 'Lift', project: 'Skole Vest', status: MachineStatus.LEDIG }
      ]
    });
    seeded = true;

    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    const machines = await prisma.machine.findMany({ orderBy: { machineNumber: 'asc' } });

    if (users.length >= 4 && machines.length >= 10) {
      await prisma.machine.update({ where: { id: machines[0].id }, data: { responsibleUserId: users[0].id, status: MachineStatus.TILDELT } });
      await prisma.machine.update({ where: { id: machines[2].id }, data: { responsibleUserId: users[1].id, status: MachineStatus.TILDELT } });
      await prisma.machine.update({ where: { id: machines[5].id }, data: { responsibleUserId: users[2].id, status: MachineStatus.TILDELT } });
      await prisma.machine.update({ where: { id: machines[9].id }, data: { responsibleUserId: users[3].id, status: MachineStatus.TILDELT } });
    }
  }

  return {
    seeded,
    users: await prisma.user.count(),
    machines: await prisma.machine.count()
  };
}
