/*
  Warnings:

  - You are about to drop the column `documentPath` on the `EMDTracking` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `EMDTracking` table. All the data in the column will be lost.
  - You are about to drop the column `returnDate` on the `EMDTracking` table. All the data in the column will be lost.
  - Added the required column `approvalLevels` to the `BudgetaryOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offerDate` to the `BudgetaryOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offerId` to the `BudgetaryOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankName` to the `EMDTracking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BudgetaryOffer" ADD COLUMN     "approvalLevels" JSONB NOT NULL,
ADD COLUMN     "currentApprovalLevel" INTEGER,
ADD COLUMN     "offerDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "offerId" TEXT NOT NULL,
ADD COLUMN     "rejectionHistory" JSONB;

-- AlterTable
ALTER TABLE "EMDTracking" DROP COLUMN "documentPath",
DROP COLUMN "dueDate",
DROP COLUMN "returnDate",
ADD COLUMN     "bankName" VARCHAR(100) NOT NULL,
ADD COLUMN     "documentKey" TEXT,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "uploadedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "BudgetaryOffer_createdById_idx" ON "BudgetaryOffer"("createdById");

-- CreateIndex
CREATE INDEX "BudgetaryOffer_offerDate_idx" ON "BudgetaryOffer"("offerDate");

-- CreateIndex
CREATE INDEX "EMDTracking_offerId_idx" ON "EMDTracking"("offerId");
