import { prisma } from '@/lib/prisma';

let ensuredUserAuthColumns = false;

export async function ensureUserAuthColumns() {
  if (!process.env.DATABASE_URL) return;
  if (ensuredUserAuthColumns) return;

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'User'
      ) THEN
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '';
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'USER';
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "departmentId" TEXT;
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
      END IF;
    END
    $$;
  `);
  await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN';`);
  await prisma.$executeRawUnsafe(`
    UPDATE "User"
    SET "role" = 'ADMIN'::"UserRole"
    WHERE "role"::text IN ('SUPERADMIN', 'COMPANY_ADMIN', 'DEPARTMENT_MANAGER');
  `);

  ensuredUserAuthColumns = true;
}
