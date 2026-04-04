-- Company-utvidelse: orgNumber + obligatorisk company på User/Machine
ALTER TABLE IF EXISTS "Company"
  ADD COLUMN IF NOT EXISTS "orgNumber" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Company_orgNumber_key" ON "Company"("orgNumber");

ALTER TABLE IF EXISTS "Machine"
  ADD COLUMN IF NOT EXISTS "companyId" TEXT;

DO $$
DECLARE
  default_company_id TEXT;
BEGIN
  SELECT "id" INTO default_company_id
  FROM "Company"
  WHERE "name" = 'Standard bedrift'
  LIMIT 1;

  IF default_company_id IS NULL THEN
    INSERT INTO "Company" ("id", "name", "createdAt", "updatedAt")
    VALUES (md5(random()::text || clock_timestamp()::text), 'Standard bedrift', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING "id" INTO default_company_id;
  END IF;

  UPDATE "User"
  SET "companyId" = default_company_id
  WHERE "companyId" IS NULL;

  UPDATE "Machine" m
  SET "companyId" = p."companyId"
  FROM "Project" p
  WHERE m."projectId" = p."id" AND m."companyId" IS NULL;

  UPDATE "Machine"
  SET "companyId" = default_company_id
  WHERE "companyId" IS NULL;
END $$;

ALTER TABLE IF EXISTS "User"
  ALTER COLUMN "companyId" SET NOT NULL;

ALTER TABLE IF EXISTS "Machine"
  ALTER COLUMN "companyId" SET NOT NULL;

ALTER TABLE IF EXISTS "User"
  DROP CONSTRAINT IF EXISTS "User_companyId_fkey";

ALTER TABLE IF EXISTS "User"
  ADD CONSTRAINT "User_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF EXISTS "Machine"
  DROP CONSTRAINT IF EXISTS "Machine_companyId_fkey";

ALTER TABLE IF EXISTS "Machine"
  ADD CONSTRAINT "Machine_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "Machine_companyId_idx" ON "Machine"("companyId");
