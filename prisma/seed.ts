import { PrismaClient } from '@prisma/client';
import { ensureDatabaseSetup } from '../lib/db-init';

const prisma = new PrismaClient();

async function main() {
  await ensureDatabaseSetup();
  const stats = await prisma.machine.count();
  console.log(`Seed ferdig. Maskiner: ${stats}`);
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
