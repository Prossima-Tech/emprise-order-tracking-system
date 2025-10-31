-- Make maturityDate nullable for FDR bulk imports
-- This is required because:
-- 1. The Prisma schema defines maturityDate as optional (maturityDate DateTime?)
-- 2. Excel imports may not include maturity dates for all FDRs
-- 3. It's valid for some FDRs/BGs to not have a maturity date

ALTER TABLE "fdrs" ALTER COLUMN "maturityDate" DROP NOT NULL;
