-- AlterTable
ALTER TABLE "LOA" ADD COLUMN     "emdAmount" DOUBLE PRECISION,
ADD COLUMN     "hasEmd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPerformanceGuarantee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasSecurityDeposit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "performanceGuaranteeAmount" DOUBLE PRECISION,
ADD COLUMN     "performanceGuaranteeDocumentUrl" TEXT,
ADD COLUMN     "securityDepositAmount" DOUBLE PRECISION,
ADD COLUMN     "securityDepositDocumentUrl" TEXT;
