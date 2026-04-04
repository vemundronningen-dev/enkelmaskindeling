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
        CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');
      END IF;
    END
    $$;
  `);
  await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN';`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Company" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "orgNumber" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "orgNumber" TEXT;`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Company_name_key" ON "Company"("name");`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Company_orgNumber_key" ON "Company"("orgNumber");`);

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
      "companyId" TEXT,
      "project" TEXT NOT NULL,
      "projectId" TEXT,
      "status" "MachineStatus" NOT NULL DEFAULT 'LEDIG',
      "responsibleUserId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" ADD COLUMN IF NOT EXISTS "companyId" TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" ADD COLUMN IF NOT EXISTS "projectId" TEXT;`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Machine_machineNumber_key" ON "Machine"("machineNumber");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Machine_companyId_idx" ON "Machine"("companyId");`);

  const defaultCompany = await prisma.company.upsert({
    where: { name: 'Standard bedrift' },
    create: { name: 'Standard bedrift' },
    update: {}
  });

  await prisma.$executeRaw`
    UPDATE "User"
    SET "companyId" = ${defaultCompany.id}
    WHERE "companyId" IS NULL;
  `;
  await prisma.$executeRawUnsafe(`
    UPDATE "User"
    SET "role" = 'ADMIN'::"UserRole"
    WHERE "role"::text IN ('SUPERADMIN', 'COMPANY_ADMIN', 'DEPARTMENT_MANAGER');
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "Machine" m
    SET "companyId" = p."companyId"
    FROM "Project" p
    WHERE m."projectId" = p."id" AND m."companyId" IS NULL;
  `);

  await prisma.$executeRaw`
    UPDATE "Machine"
    SET "companyId" = ${defaultCompany.id}
    WHERE "companyId" IS NULL;
  `;

  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN "companyId" SET NOT NULL;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Machine" ALTER COLUMN "companyId" SET NOT NULL;`);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Department_companyId_fkey') THEN
        ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Project_companyId_fkey') THEN
        ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Project_departmentId_fkey') THEN
        ALTER TABLE "Project" ADD CONSTRAINT "Project_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;

      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_companyId_fkey') THEN
        ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";
      END IF;
      ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_departmentId_fkey') THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Session_userId_fkey') THEN
        ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Machine_responsibleUserId_fkey') THEN
        ALTER TABLE "Machine" ADD CONSTRAINT "Machine_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Machine_projectId_fkey') THEN
        ALTER TABLE "Machine" ADD CONSTRAINT "Machine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;

      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Machine_companyId_fkey') THEN
        ALTER TABLE "Machine" DROP CONSTRAINT "Machine_companyId_fkey";
      END IF;
      ALTER TABLE "Machine" ADD CONSTRAINT "Machine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END
    $$;
  `);

  let seeded = false;

  const adminEmail = 'admin@demo.no';
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

  const demoCompany = await prisma.company.upsert({
    where: { name: 'Demo Entreprenør AS' },
    create: { name: 'Demo Entreprenør AS', orgNumber: '999888777' },
    update: { orgNumber: '999888777' }
  });

  const anlegg = await prisma.department.upsert({
    where: { companyId_name: { companyId: demoCompany.id, name: 'Anlegg' } },
    create: { name: 'Anlegg', companyId: demoCompany.id },
    update: {}
  });

  const service = await prisma.department.upsert({
    where: { companyId_name: { companyId: demoCompany.id, name: 'Service' } },
    create: { name: 'Service', companyId: demoCompany.id },
    update: {}
  });

  const prosjektNord = await prisma.project.upsert({
    where: { companyId_name: { companyId: demoCompany.id, name: 'Prosjekt Nord' } },
    create: { name: 'Prosjekt Nord', companyId: demoCompany.id, departmentId: anlegg.id },
    update: {}
  });

  const prosjektSyd = await prisma.project.upsert({
    where: { companyId_name: { companyId: demoCompany.id, name: 'Prosjekt Syd' } },
    create: { name: 'Prosjekt Syd', companyId: demoCompany.id, departmentId: service.id },
    update: {}
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'Systemadmin',
        email: adminEmail,
        phone: '+47 900 00 999',
        passwordHash: hashPassword('Admin123!'),
        role: UserRole.ADMIN,
        companyId: demoCompany.id
      }
    });
    seeded = true;
  }

  await prisma.user.upsert({
    where: { email: 'bruker1@demo.no' },
    create: {
      name: 'Vanlig Bruker 1',
      email: 'bruker1@demo.no',
      phone: '+47 900 00 001',
      passwordHash: hashPassword('Passord123!'),
      role: UserRole.USER,
      companyId: demoCompany.id,
      departmentId: anlegg.id
    },
    update: {}
  });
  await prisma.user.upsert({
    where: { email: 'bruker2@demo.no' },
    create: {
      name: 'Vanlig Bruker 2',
      email: 'bruker2@demo.no',
      phone: '+47 900 00 002',
      passwordHash: hashPassword('Passord123!'),
      role: UserRole.USER,
      companyId: demoCompany.id,
      departmentId: service.id
    },
    update: {}
  });

  const machineCount = await prisma.machine.count();

  if (machineCount === 0) {
    await prisma.machine.createMany({
      data: [
        { name: 'Gravemaskin DEMO-01', machineNumber: 'DEMO-1001', type: 'Gravemaskin', project: prosjektNord.name, projectId: prosjektNord.id, companyId: demoCompany.id, status: MachineStatus.LEDIG },
        { name: 'Pumpe DEMO-02', machineNumber: 'DEMO-1002', type: 'Pumpe', project: prosjektNord.name, projectId: prosjektNord.id, companyId: demoCompany.id, status: MachineStatus.SERVICE },
        { name: 'Generator DEMO-03', machineNumber: 'DEMO-1003', type: 'Generator', project: prosjektSyd.name, projectId: prosjektSyd.id, companyId: demoCompany.id, status: MachineStatus.LEDIG },
        { name: 'Lastebil DEMO-04', machineNumber: 'DEMO-1004', type: 'Lastebil', project: prosjektSyd.name, projectId: prosjektSyd.id, companyId: demoCompany.id, status: MachineStatus.LEDIG }
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
