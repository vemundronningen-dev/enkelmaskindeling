import { prisma } from '@/lib/prisma';

let ensuredPasswordColumn = false;

export async function ensureUserPasswordHashColumn() {
  if (!process.env.DATABASE_URL) return;
  if (ensuredPasswordColumn) return;

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'User'
      ) THEN
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
      END IF;
    END
    $$;
  `);

  ensuredPasswordColumn = true;
}
