-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "loaId" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "invoiceAmount" DOUBLE PRECISION,
    "totalReceivables" DOUBLE PRECISION,
    "actualAmountReceived" DOUBLE PRECISION,
    "amountDeducted" DOUBLE PRECISION,
    "amountPending" DOUBLE PRECISION,
    "deductionReason" TEXT,
    "billLinks" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Invoice_loaId_idx" ON "Invoice"("loaId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_loaId_fkey" FOREIGN KEY ("loaId") REFERENCES "LOA"("id") ON DELETE CASCADE ON UPDATE CASCADE;
