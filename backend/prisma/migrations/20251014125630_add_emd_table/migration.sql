-- CreateEnum (only if not exists)
DO $$ BEGIN
  CREATE TYPE "EMDStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'RELEASED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE "EMD" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT NOT NULL DEFAULT 'FDR',
    "submissionDate" TIMESTAMP(3) NOT NULL,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "bankName" TEXT NOT NULL DEFAULT 'IDBI',
    "documentUrl" TEXT,
    "extractedData" JSONB,
    "status" "EMDStatus" NOT NULL DEFAULT 'ACTIVE',
    "offerId" TEXT,
    "loaId" TEXT,
    "tenderId" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EMD_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EMD_offerId_idx" ON "EMD"("offerId");

-- CreateIndex
CREATE INDEX "EMD_loaId_idx" ON "EMD"("loaId");

-- CreateIndex
CREATE INDEX "EMD_tenderId_idx" ON "EMD"("tenderId");

-- CreateIndex
CREATE INDEX "EMD_status_idx" ON "EMD"("status");

-- CreateIndex
CREATE INDEX "EMD_maturityDate_idx" ON "EMD"("maturityDate");

-- AddForeignKey
ALTER TABLE "EMD" ADD CONSTRAINT "EMD_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "BudgetaryOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EMD" ADD CONSTRAINT "EMD_loaId_fkey" FOREIGN KEY ("loaId") REFERENCES "LOA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EMD" ADD CONSTRAINT "EMD_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE SET NULL ON UPDATE CASCADE;
