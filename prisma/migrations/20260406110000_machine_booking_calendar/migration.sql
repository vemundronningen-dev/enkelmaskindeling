-- AlterEnum
ALTER TYPE "MachineStatus" ADD VALUE IF NOT EXISTS 'BOOKET';
ALTER TYPE "MachineStatus" ADD VALUE IF NOT EXISTS 'I_BRUK';
ALTER TYPE "MachineStatus" ADD VALUE IF NOT EXISTS 'UTE_AV_DRIFT';

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM ('PLANLAGT', 'AKTIV', 'FULLFORT', 'KANSELLERT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Machine"
  ADD COLUMN IF NOT EXISTS "manualOverrideStatus" "MachineStatus",
  ADD COLUMN IF NOT EXISTS "manualOverrideReason" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "MachineBooking" (
  "id" TEXT NOT NULL,
  "machineId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "projectId" TEXT,
  "location" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'PLANLAGT',
  "responsibleUserId" TEXT NOT NULL,
  "companyName" TEXT,
  "comment" TEXT,
  "cancelledAt" TIMESTAMP(3),
  "cancelledById" TEXT,
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MachineBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MachineStatusLog" (
  "id" TEXT NOT NULL,
  "machineId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "fromStatus" "MachineStatus",
  "toStatus" "MachineStatus" NOT NULL,
  "source" TEXT NOT NULL,
  "note" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MachineStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MachineLocationHistory" (
  "id" TEXT NOT NULL,
  "machineId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "bookingId" TEXT,
  "projectId" TEXT,
  "location" TEXT NOT NULL,
  "responsibleUserId" TEXT,
  "note" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MachineLocationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MachineBooking_machineId_startAt_endAt_idx" ON "MachineBooking"("machineId", "startAt", "endAt");
CREATE INDEX IF NOT EXISTS "MachineBooking_companyId_startAt_idx" ON "MachineBooking"("companyId", "startAt");
CREATE INDEX IF NOT EXISTS "MachineStatusLog_machineId_createdAt_idx" ON "MachineStatusLog"("machineId", "createdAt");
CREATE INDEX IF NOT EXISTS "MachineLocationHistory_machineId_createdAt_idx" ON "MachineLocationHistory"("machineId", "createdAt");
CREATE INDEX IF NOT EXISTS "MachineLocationHistory_companyId_createdAt_idx" ON "MachineLocationHistory"("companyId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "MachineBooking" ADD CONSTRAINT "MachineBooking_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineBooking" ADD CONSTRAINT "MachineBooking_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineBooking" ADD CONSTRAINT "MachineBooking_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineBooking" ADD CONSTRAINT "MachineBooking_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineBooking" ADD CONSTRAINT "MachineBooking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineBooking" ADD CONSTRAINT "MachineBooking_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "MachineStatusLog" ADD CONSTRAINT "MachineStatusLog_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineStatusLog" ADD CONSTRAINT "MachineStatusLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineStatusLog" ADD CONSTRAINT "MachineStatusLog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "MachineLocationHistory" ADD CONSTRAINT "MachineLocationHistory_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineLocationHistory" ADD CONSTRAINT "MachineLocationHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineLocationHistory" ADD CONSTRAINT "MachineLocationHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "MachineBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineLocationHistory" ADD CONSTRAINT "MachineLocationHistory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineLocationHistory" ADD CONSTRAINT "MachineLocationHistory_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "MachineLocationHistory" ADD CONSTRAINT "MachineLocationHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
