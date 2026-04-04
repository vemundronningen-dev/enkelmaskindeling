import { MachineStatus, PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../lib/password';
import { ensureDatabaseSetup } from '../lib/db-init';

const prisma = new PrismaClient();

async function main() {
  await ensureDatabaseSetup();

  const company = await prisma.company.upsert({
    where: { name: 'Demo Entreprenør AS' },
    create: { name: 'Demo Entreprenør AS', orgNumber: '999888777' },
    update: { orgNumber: '999888777' }
  });

  const anlegg = await prisma.department.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Anlegg' } },
    create: { name: 'Anlegg', companyId: company.id },
    update: {}
  });

  const service = await prisma.department.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Service' } },
    create: { name: 'Service', companyId: company.id },
    update: {}
  });

  const nord = await prisma.project.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Prosjekt Nord' } },
    create: { name: 'Prosjekt Nord', companyId: company.id, departmentId: anlegg.id },
    update: {}
  });

  const syd = await prisma.project.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Prosjekt Syd' } },
    create: { name: 'Prosjekt Syd', companyId: company.id, departmentId: service.id },
    update: {}
  });

  await prisma.user.upsert({
    where: { email: 'admin@demo.no' },
    create: {
      name: 'Demo Admin',
      email: 'admin@demo.no',
      phone: '+47 900 00 999',
      passwordHash: await hashPassword('Admin123!'),
      role: UserRole.ADMIN,
      companyId: company.id
    },
    update: { role: UserRole.ADMIN, companyId: company.id }
  });

  await prisma.user.upsert({
    where: { email: 'bruker1@demo.no' },
    create: {
      name: 'Vanlig Bruker 1',
      email: 'bruker1@demo.no',
      phone: '+47 900 00 001',
      passwordHash: await hashPassword('Passord123!'),
      role: UserRole.USER,
      companyId: company.id,
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
      passwordHash: await hashPassword('Passord123!'),
      role: UserRole.USER,
      companyId: company.id,
      departmentId: service.id
    },
    update: {}
  });

  await prisma.machine.upsert({
    where: { machineNumber: 'DEMO-1001' },
    create: {
      name: 'Gravemaskin DEMO-01',
      machineNumber: 'DEMO-1001',
      type: 'Gravemaskin',
      project: nord.name,
      projectId: nord.id,
      companyId: company.id,
      status: MachineStatus.LEDIG
    },
    update: {}
  });

  await prisma.machine.upsert({
    where: { machineNumber: 'DEMO-1002' },
    create: {
      name: 'Pumpe DEMO-02',
      machineNumber: 'DEMO-1002',
      type: 'Pumpe',
      project: nord.name,
      projectId: nord.id,
      companyId: company.id,
      status: MachineStatus.SERVICE
    },
    update: {}
  });

  await prisma.machine.upsert({
    where: { machineNumber: 'DEMO-1003' },
    create: {
      name: 'Generator DEMO-03',
      machineNumber: 'DEMO-1003',
      type: 'Generator',
      project: syd.name,
      projectId: syd.id,
      companyId: company.id,
      status: MachineStatus.LEDIG
    },
    update: {}
  });

  console.log('Seed ferdig for company-basert demo.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
