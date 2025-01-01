/*
  Warnings:

  - You are about to alter the column `amount` on the `BudgetaryOffer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - You are about to alter the column `emdAmount` on the `BudgetaryOffer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - You are about to alter the column `amount` on the `EMDTracking` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - You are about to alter the column `amount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - You are about to alter the column `value` on the `LOA` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - You are about to alter the column `additionalValue` on the `LOAAmendment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - You are about to alter the column `value` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - You are about to alter the column `unitPrice` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - You are about to alter the column `totalPrice` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - Added the required column `createdById` to the `LOAAmendment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BudgetaryOffer" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "emdAmount" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "EMDTracking" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "LOA" ALTER COLUMN "value" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "LOAAmendment" ADD COLUMN     "createdById" TEXT NOT NULL,
ALTER COLUMN "additionalValue" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "value" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "PurchaseOrderItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(15,2);

-- CreateTable
CREATE TABLE "PurchaseOrderStatusHistory" (
    "id" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "PurchaseOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PurchaseOrderStatusHistory_poId_idx" ON "PurchaseOrderStatusHistory"("poId");

-- CreateIndex
CREATE INDEX "LOA_offerId_idx" ON "LOA"("offerId");

-- CreateIndex
CREATE INDEX "LOA_managedById_idx" ON "LOA"("managedById");

-- CreateIndex
CREATE INDEX "LOAAmendment_loaId_idx" ON "LOAAmendment"("loaId");

-- CreateIndex
CREATE INDEX "LOAAmendment_createdById_idx" ON "LOAAmendment"("createdById");

-- CreateIndex
CREATE INDEX "PurchaseOrder_vendorId_idx" ON "PurchaseOrder"("vendorId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_loaId_idx" ON "PurchaseOrder"("loaId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_poId_idx" ON "PurchaseOrderItem"("poId");

-- AddForeignKey
ALTER TABLE "LOAAmendment" ADD CONSTRAINT "LOAAmendment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderStatusHistory" ADD CONSTRAINT "PurchaseOrderStatusHistory_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderStatusHistory" ADD CONSTRAINT "PurchaseOrderStatusHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
