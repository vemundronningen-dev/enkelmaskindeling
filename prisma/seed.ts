import { MachineStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.machine.deleteMany();
  await prisma.user.deleteMany();
  await prisma.project.deleteMany();

  const users = await prisma.user.createManyAndReturn({
    data: [
      { name: 'Ola Nordmann', email: 'ola@example.com', phone: '+47 900 00 001' },
      { name: 'Kari Hansen', email: 'kari@example.com', phone: '+47 900 00 002' },
      { name: 'Per Olsen', email: 'per@example.com', phone: '+47 900 00 003' },
      { name: 'Anne Nilsen', email: 'anne@example.com', phone: '+47 900 00 004' },
      { name: 'Mina Johansen', email: 'mina@example.com', phone: '+47 900 00 005' }
    ]
  });

  const projectNames = ['E6 Nord', 'Havn Vest', 'Tunnel Sør', 'Asfalt Øst', 'Bygg Sentrum', 'Skole Vest'];

  await prisma.project.createMany({
    data: projectNames.map((name) => ({ name }))
  });

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

  const machines = await prisma.machine.findMany({ orderBy: { machineNumber: 'asc' } });

  await prisma.machine.update({ where: { id: machines[0].id }, data: { responsibleUserId: users[0].id, status: MachineStatus.TILDELT } });
  await prisma.machine.update({ where: { id: machines[2].id }, data: { responsibleUserId: users[1].id, status: MachineStatus.TILDELT } });
  await prisma.machine.update({ where: { id: machines[5].id }, data: { responsibleUserId: users[2].id, status: MachineStatus.TILDELT } });
  await prisma.machine.update({ where: { id: machines[9].id }, data: { responsibleUserId: users[3].id, status: MachineStatus.TILDELT } });
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
