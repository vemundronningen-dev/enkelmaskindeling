import { MachineStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.machine.deleteMany();
  await prisma.user.deleteMany();

  const users = await prisma.user.createManyAndReturn({
    data: [
      { name: 'Ola Nordmann', email: 'ola@example.com' },
      { name: 'Kari Hansen', email: 'kari@example.com' },
      { name: 'Per Olsen', email: 'per@example.com' },
      { name: 'Anne Nilsen', email: 'anne@example.com' },
      { name: 'Mina Johansen', email: 'mina@example.com' }
    ]
  });

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
