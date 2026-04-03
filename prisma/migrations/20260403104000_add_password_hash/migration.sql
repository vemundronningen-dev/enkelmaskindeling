-- Legg til passwordHash for eksisterende deploys
ALTER TABLE IF EXISTS "User"
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

UPDATE "User"
SET "passwordHash" = ''
WHERE "passwordHash" IS NULL;

ALTER TABLE IF EXISTS "User"
  ALTER COLUMN "passwordHash" SET DEFAULT '';

ALTER TABLE IF EXISTS "User"
  ALTER COLUMN "passwordHash" SET NOT NULL;
