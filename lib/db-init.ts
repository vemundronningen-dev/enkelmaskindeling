import { MachineStatus, UserRole } from '@prisma/client';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

export async function ensureDatabaseSetup() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MachineStatus') THEN
        CREATE TYPE "MachineStatus" AS ENUM ('LEDIG', 'TILDELT', 'SERVICE');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'COMPANY_ADMIN', 'DEPARTMENT_MANAGER', 'USER');
      END IF;
    END
    $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Company" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Company_name_key" ON "Company"("name");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Department" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "companyId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Department_companyId_name_key" ON "Department"("companyId", "name");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Project" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "companyId" TEXT NOT NULL,
      "departmentId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Project_companyId_name_key" ON "Project"("companyId", "name");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "passwordHash" TEXT NOT NULL DEFAULT '',
      "role" "UserRole" NOT NULL DEFAULT 'USER',
      "companyId" TEXT,
      "departmentId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'USER';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyId" TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "departmentId" TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Machine" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "machineNumber" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "project" TEXT NOT NULL,
      "projectId" TEXT,
      "status" "MachineStatus" NOT NULL DEFAULT 'LEDIG',
      "responsibleUserId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" ADD COLUMN IF NOT EXISTS "projectId" TEXT;`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Machine_machineNumber_key" ON "Machine"("machineNumber");`);

  await prisma.$executeRawUnsafe(`ALTER TABLE "Department" DROP CONSTRAINT IF EXISTS "Department_companyId_fkey";`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_companyId_fkey";`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_departmentId_fkey";`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_companyId_fkey";`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_departmentId_fkey";`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" DROP CONSTRAINT IF EXISTS "Machine_responsibleUserId_fkey";`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" DROP CONSTRAINT IF EXISTS "Machine_projectId_fkey";`);

  await prisma.$executeRawUnsafe(`ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Project" ADD CONSTRAINT "Project_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" ADD CONSTRAINT "Machine_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" ADD CONSTRAINT "Machine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);

  let seeded = false;

  const adminEmail = 'admin@maskin.no';
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

  const oslo = await prisma.company.upsert({
    where: { name: 'Oslo kommune' },
    create: { name: 'Oslo kommune' },
    update: {}
  });

  const af = await prisma.company.upsert({
    where: { name: 'AF Gruppen' },
    create: { name: 'AF Gruppen' },
    update: {}
  });

  const vann = await prisma.department.upsert({
    where: { companyId_name: { companyId: oslo.id, name: 'Vann- og avløpsetaten' } },
    create: { name: 'Vann- og avløpsetaten', companyId: oslo.id },
    update: {}
  });

  const energi = await prisma.department.upsert({
    where: { companyId_name: { companyId: oslo.id, name: 'Eiendom og energi' } },
    create: { name: 'Eiendom og energi', companyId: oslo.id },
    update: {}
  });

  const afDept = await prisma.department.upsert({
    where: { companyId_name: { companyId: af.id, name: 'Prosjektadministrasjon' } },
    create: { name: 'Prosjektadministrasjon', companyId: af.id },
    update: {}
  });

  const e1 = await prisma.project.upsert({
    where: { companyId_name: { companyId: af.id, name: 'E1 Vannbehandlingsanlegg' } },
    create: { name: 'E1 Vannbehandlingsanlegg', companyId: af.id, departmentId: afDept.id },
    update: {}
  });

  const rkv = await prisma.project.upsert({
    where: { companyId_name: { companyId: af.id, name: 'RKV Regjeringskvartalet energiforsyning' } },
    create: { name: 'RKV Regjeringskvartalet energiforsyning', companyId: af.id, departmentId: afDept.id },
    update: {}
  });

  await prisma.project.upsert({
    where: { companyId_name: { companyId: oslo.id, name: 'Vannnett Sentrum' } },
    create: { name: 'Vannnett Sentrum', companyId: oslo.id, departmentId: vann.id },
    update: {}
  });

  await prisma.project.upsert({
    where: { companyId_name: { companyId: oslo.id, name: 'Energieffektivisering Rådhuset' } },
    create: { name: 'Energieffektivisering Rådhuset', companyId: oslo.id, departmentId: energi.id },
    update: {}
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'Systemadmin',
        email: adminEmail,
        phone: '+47 900 00 999',
        passwordHash: hashPassword('Admin123!'),
        role: UserRole.SUPERADMIN,
        companyId: oslo.id
      }
    });
    seeded = true;
  }

  const machineCount = await prisma.machine.count();

  if (machineCount === 0) {
    await prisma.machine.createMany({
      data: [
        { name: 'Gravemaskin AF-01', machineNumber: 'AF-1001', type: 'Gravemaskin', project: e1.name, projectId: e1.id, status: MachineStatus.LEDIG },
        { name: 'Pumpe AF-02', machineNumber: 'AF-1002', type: 'Pumpe', project: e1.name, projectId: e1.id, status: MachineStatus.SERVICE },
        { name: 'Generator AF-03', machineNumber: 'AF-1003', type: 'Generator', project: rkv.name, projectId: rkv.id, status: MachineStatus.LEDIG },
        { name: 'Løftekran AF-04', machineNumber: 'AF-1004', type: 'Kran', project: rkv.name, projectId: rkv.id, status: MachineStatus.LEDIG }
      ]
    });
    seeded = true;
  }

  const missingPasswordUsers = await prisma.user.findMany({ where: { passwordHash: '' } });
  if (missingPasswordUsers.length > 0) {
    for (const user of missingPasswordUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword('Passord123!') }
      });
    }
  }

  return {
    seeded,
    companies: await prisma.company.count(),
    departments: await prisma.department.count(),
    projects: await prisma.project.count(),
    users: await prisma.user.count(),
    machines: await prisma.machine.count()
  };
}
