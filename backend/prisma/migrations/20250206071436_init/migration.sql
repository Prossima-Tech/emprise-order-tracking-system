/*
  Warnings:

  - You are about to drop the column `taxRates` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `taxRate` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[loaId]` on the table `EMD` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `siteId` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE');

-- AlterTable
ALTER TABLE "BudgetaryOffer" ADD COLUMN     "railwayZone" TEXT DEFAULT 'CR';

-- AlterTable
ALTER TABLE "EMD" ADD COLUMN     "loaId" TEXT;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "taxRates";

-- AlterTable
ALTER TABLE "LOA" ADD COLUMN     "siteId" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "baseAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "siteId" TEXT NOT NULL,
ADD COLUMN     "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseOrderItem" DROP COLUMN "taxRate",
ALTER COLUMN "unitPrice" DROP NOT NULL,
ALTER COLUMN "totalAmount" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "location" TEXT,
    "address" TEXT NOT NULL,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "status" "SiteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_name_key" ON "Site"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Site_code_key" ON "Site"("code");

-- CreateIndex
CREATE INDEX "Site_zoneId_idx" ON "Site"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "EMD_loaId_key" ON "EMD"("loaId");

-- CreateIndex
CREATE INDEX "LOA_siteId_idx" ON "LOA"("siteId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_siteId_idx" ON "PurchaseOrder"("siteId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_loaId_idx" ON "PurchaseOrder"("loaId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_vendorId_idx" ON "PurchaseOrder"("vendorId");

-- AddForeignKey
ALTER TABLE "EMD" ADD CONSTRAINT "EMD_loaId_fkey" FOREIGN KEY ("loaId") REFERENCES "LOA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LOA" ADD CONSTRAINT "LOA_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
