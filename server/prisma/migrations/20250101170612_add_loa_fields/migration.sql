/*
  Warnings:

  - You are about to drop the column `createdById` on the `LOAAmendment` table. All the data in the column will be lost.
  - Added the required column `issuingAuthority` to the `LOA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedDate` to the `LOA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordedById` to the `LOA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validityPeriod` to the `LOA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amendmentType` to the `LOAAmendment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordedById` to the `LOAAmendment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LOAAmendment" DROP CONSTRAINT "LOAAmendment_createdById_fkey";

-- DropIndex
DROP INDEX "LOA_managedById_idx";

-- DropIndex
DROP INDEX "LOAAmendment_createdById_idx";

-- AlterTable
ALTER TABLE "LOA" ADD COLUMN     "department" TEXT,
ADD COLUMN     "issuingAuthority" TEXT NOT NULL,
ADD COLUMN     "projectCode" TEXT,
ADD COLUMN     "receivedDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "recordedById" TEXT NOT NULL,
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "validityPeriod" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "LOAAmendment" DROP COLUMN "createdById",
ADD COLUMN     "amendmentType" TEXT NOT NULL,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "attachmentPath" TEXT,
ADD COLUMN     "recordedById" TEXT NOT NULL,
ADD COLUMN     "scopeChanges" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "validityExtension" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "LOA_recordedById_idx" ON "LOA"("recordedById");

-- CreateIndex
CREATE INDEX "LOAAmendment_recordedById_idx" ON "LOAAmendment"("recordedById");

-- CreateIndex
CREATE INDEX "LOAAmendment_status_idx" ON "LOAAmendment"("status");

-- AddForeignKey
ALTER TABLE "LOA" ADD CONSTRAINT "LOA_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LOAAmendment" ADD CONSTRAINT "LOAAmendment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LOAAmendment" ADD CONSTRAINT "LOAAmendment_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
