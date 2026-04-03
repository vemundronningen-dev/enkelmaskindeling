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
      "machineNumber" TEXT NOT NULL,
      "brand" TEXT NOT NULL DEFAULT 'Ukjent',
      "model" TEXT NOT NULL DEFAULT 'Ukjent',
      "serialNumber" TEXT,
      "type" TEXT NOT NULL,
      "project" TEXT NOT NULL,
      "status" "MachineStatus" NOT NULL DEFAULT 'LEDIG',
      "responsibleUserId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" ADD COLUMN IF NOT EXISTS "brand" TEXT NOT NULL DEFAULT 'Ukjent';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" ADD COLUMN IF NOT EXISTS "model" TEXT NOT NULL DEFAULT 'Ukjent';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" ADD COLUMN IF NOT EXISTS "serialNumber" TEXT;`);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Machine_machineNumber_key" ON "Machine"("machineNumber");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Machine_serialNumber_key" ON "Machine"("serialNumber");
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
        { machineNumber: 'M-1001', brand: 'Caterpillar', model: '320D', serialNumber: 'CAT320D-001', type: 'Gravemaskin', project: 'E6 Nord', status: MachineStatus.LEDIG },
        { machineNumber: 'M-1002', brand: 'Komatsu', model: 'PC210', serialNumber: 'KOM210-002', type: 'Gravemaskin', project: 'E6 Nord', status: MachineStatus.SERVICE },
        { machineNumber: 'M-1003', brand: 'Volvo', model: 'L90H', serialNumber: 'VOL90H-003', type: 'Hjullaster', project: 'Havn Vest', status: MachineStatus.LEDIG },
        { machineNumber: 'M-1004', brand: 'Volvo', model: 'L120H', serialNumber: 'VOL120H-004', type: 'Hjullaster', project: 'Havn Vest', status: MachineStatus.LEDIG },
        { machineNumber: 'M-1005', brand: 'Bell', model: 'B30E', serialNumber: 'BEL30E-005', type: 'Dumper', project: 'Tunnel Sør', status: MachineStatus.SERVICE },
        { machineNumber: 'M-1006', brand: 'Bell', model: 'B40E', serialNumber: 'BEL40E-006', type: 'Dumper', project: 'Tunnel Sør', status: MachineStatus.LEDIG },
        { machineNumber: 'M-1007', brand: 'Bomag', model: 'BW174', serialNumber: 'BOM174-007', type: 'Vals', project: 'Asfalt Øst', status: MachineStatus.LEDIG },
        { machineNumber: 'M-1008', brand: 'Bomag', model: 'BW213', serialNumber: 'BOM213-008', type: 'Vals', project: 'Asfalt Øst', status: MachineStatus.LEDIG },
        { machineNumber: 'M-1009', brand: 'Liebherr', model: 'LTM 1050', serialNumber: 'LIE1050-009', type: 'Kran', project: 'Bygg Sentrum', status: MachineStatus.SERVICE },
        { machineNumber: 'M-1010', brand: 'Liebherr', model: 'LTM 1090', serialNumber: 'LIE1090-010', type: 'Kran', project: 'Bygg Sentrum', status: MachineStatus.LEDIG },
        { machineNumber: 'M-1011', brand: 'JLG', model: '600AJ', serialNumber: 'JLG600-011', type: 'Lift', project: 'Skole Vest', status: MachineStatus.LEDIG },
        { machineNumber: 'M-1012', brand: 'Genie', model: 'Z-45', serialNumber: 'GEN45-012', type: 'Lift', project: 'Skole Vest', status: MachineStatus.LEDIG }
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
