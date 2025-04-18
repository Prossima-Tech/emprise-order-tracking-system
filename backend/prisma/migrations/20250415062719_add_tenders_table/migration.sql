-- CreateEnum
CREATE TYPE "TenderStatus" AS ENUM ('ACTIVE', 'CLOSED', 'CANCELLED', 'AWARDED');

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "tenderNumber" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "hasEMD" BOOLEAN NOT NULL DEFAULT false,
    "emdAmount" DOUBLE PRECISION,
    "status" "TenderStatus" NOT NULL DEFAULT 'ACTIVE',
    "documentUrl" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tender_tenderNumber_key" ON "Tender"("tenderNumber");
