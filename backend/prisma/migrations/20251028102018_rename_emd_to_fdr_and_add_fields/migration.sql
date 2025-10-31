-- Step 1: Create new FDR enum types
CREATE TYPE "FDRCategory" AS ENUM ('FD', 'BG');
CREATE TYPE "FDRStatus" AS ENUM ('RUNNING', 'COMPLETED', 'CANCELLED', 'RETURNED');

-- Step 2: Rename EMD table columns to match FDR schema
-- Rename amount to depositAmount
ALTER TABLE "EMD" RENAME COLUMN "amount" TO "depositAmount";

-- Rename submissionDate to dateOfDeposit
ALTER TABLE "EMD" RENAME COLUMN "submissionDate" TO "dateOfDeposit";

-- Step 3: Drop the old paymentMode column (not needed in FDR)
ALTER TABLE "EMD" DROP COLUMN IF EXISTS "paymentMode";

-- Step 4: Add new columns for FDR
ALTER TABLE "EMD" ADD COLUMN "category" "FDRCategory" DEFAULT 'FD';
ALTER TABLE "EMD" ADD COLUMN "accountNo" TEXT;
ALTER TABLE "EMD" ADD COLUMN "fdrNumber" TEXT;
ALTER TABLE "EMD" ADD COLUMN "accountName" TEXT;
ALTER TABLE "EMD" ADD COLUMN "maturityValue" DOUBLE PRECISION;
ALTER TABLE "EMD" ADD COLUMN "contractNo" TEXT;
ALTER TABLE "EMD" ADD COLUMN "contractDetails" TEXT;
ALTER TABLE "EMD" ADD COLUMN "poc" TEXT;
ALTER TABLE "EMD" ADD COLUMN "location" TEXT;
ALTER TABLE "EMD" ADD COLUMN "emdAmount" DOUBLE PRECISION;
ALTER TABLE "EMD" ADD COLUMN "sdAmount" DOUBLE PRECISION;

-- Step 5: Update status column to use new FDRStatus enum
ALTER TABLE "EMD" ADD COLUMN "status_new" "FDRStatus" DEFAULT 'RUNNING';

-- Map old EMDStatus values to new FDRStatus values
UPDATE "EMD" SET "status_new" = CASE
  WHEN "status"::text = 'ACTIVE' THEN 'RUNNING'::"FDRStatus"
  WHEN "status"::text = 'EXPIRED' THEN 'COMPLETED'::"FDRStatus"
  WHEN "status"::text = 'RELEASED' THEN 'RETURNED'::"FDRStatus"
  ELSE 'RUNNING'::"FDRStatus"
END;

-- Drop old status column and rename new one
ALTER TABLE "EMD" DROP COLUMN "status";
ALTER TABLE "EMD" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "EMD" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "EMD" ALTER COLUMN "status" SET DEFAULT 'RUNNING';

-- Step 6: Drop old EMDStatus enum
DROP TYPE "EMDStatus";

-- Step 7: Rename table from EMD to fdrs
ALTER TABLE "EMD" RENAME TO "fdrs";

-- Step 8: Update indexes to reference new table name
DROP INDEX IF EXISTS "EMD_offerId_idx";
DROP INDEX IF EXISTS "EMD_loaId_idx";
DROP INDEX IF EXISTS "EMD_tenderId_idx";
DROP INDEX IF EXISTS "EMD_status_idx";
DROP INDEX IF EXISTS "EMD_maturityDate_idx";

CREATE INDEX "fdrs_offerId_idx" ON "fdrs"("offerId");
CREATE INDEX "fdrs_loaId_idx" ON "fdrs"("loaId");
CREATE INDEX "fdrs_tenderId_idx" ON "fdrs"("tenderId");
CREATE INDEX "fdrs_status_idx" ON "fdrs"("status");
CREATE INDEX "fdrs_maturityDate_idx" ON "fdrs"("maturityDate");
CREATE INDEX "fdrs_category_idx" ON "fdrs"("category");

-- Step 9: Update foreign key constraint names (they are automatically renamed with the table)
