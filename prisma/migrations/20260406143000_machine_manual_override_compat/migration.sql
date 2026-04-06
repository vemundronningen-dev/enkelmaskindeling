-- Compatibility patch: make sure machine manual override fields exist in environments
-- where the booking/status migration has not been applied fully.
ALTER TYPE "MachineStatus" ADD VALUE IF NOT EXISTS 'BOOKET';
ALTER TYPE "MachineStatus" ADD VALUE IF NOT EXISTS 'I_BRUK';
ALTER TYPE "MachineStatus" ADD VALUE IF NOT EXISTS 'UTE_AV_DRIFT';

ALTER TABLE "Machine"
  ADD COLUMN IF NOT EXISTS "manualOverrideStatus" "MachineStatus",
  ADD COLUMN IF NOT EXISTS "manualOverrideReason" TEXT;
