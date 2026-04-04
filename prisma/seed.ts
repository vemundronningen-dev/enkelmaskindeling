import { PrismaClient, UserRole } from '@prisma/client';
import { ensureDatabaseSetup } from '../lib/db-init';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

async function main() {
  await ensureDatabaseSetup();

  const firstCompany = await prisma.company.findFirst({ orderBy: { createdAt: 'asc' } });

  if (firstCompany) {
    const seedUsers = [
      { name: 'Drift Bruker 1', email: 'drift1@example.com', password: 'Passord123!', role: UserRole.USER },
      { name: 'Drift Bruker 2', email: 'drift2@example.com', password: 'Passord123!', role: UserRole.USER },
      { name: 'Prosjektleder', email: 'prosjektleder@example.com', password: 'Passord123!', role: UserRole.COMPANY_ADMIN }
    ];

    for (const seedUser of seedUsers) {
      await prisma.user.upsert({
        where: { email: seedUser.email },
        update: {
          name: seedUser.name,
          role: seedUser.role,
          companyId: firstCompany.id,
          passwordHash: hashPassword(seedUser.password)
        },
        create: {
          name: seedUser.name,
          email: seedUser.email,
          role: seedUser.role,
          companyId: firstCompany.id,
          passwordHash: hashPassword(seedUser.password)
        }
      });
    }
  }

  const stats = await prisma.user.count();
  console.log(`Seed ferdig. Brukere: ${stats}`);
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
