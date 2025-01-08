/*
  Warnings:

  - You are about to drop the column `amount` on the `BudgetaryOffer` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `BudgetaryOffer` table. All the data in the column will be lost.
  - You are about to drop the column `emdAmount` on the `BudgetaryOffer` table. All the data in the column will be lost.
  - You are about to drop the column `tenderNo` on the `BudgetaryOffer` table. All the data in the column will be lost.
  - You are about to drop the column `offerId` on the `LOA` table. All the data in the column will be lost.
  - Added the required column `emdDetails` to the `BudgetaryOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromAuthority` to the `BudgetaryOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `BudgetaryOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termsAndConditions` to the `BudgetaryOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toAuthority` to the `BudgetaryOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workItems` to the `BudgetaryOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMode` to the `EMDTracking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LOA" DROP CONSTRAINT "LOA_offerId_fkey";

-- DropIndex
DROP INDEX "BudgetaryOffer_tenderNo_key";

-- DropIndex
DROP INDEX "LOA_offerId_idx";

-- AlterTable
ALTER TABLE "BudgetaryOffer" DROP COLUMN "amount",
DROP COLUMN "dueDate",
DROP COLUMN "emdAmount",
DROP COLUMN "tenderNo",
ADD COLUMN     "emdDetails" JSONB NOT NULL,
ADD COLUMN     "fromAuthority" VARCHAR(100) NOT NULL,
ADD COLUMN     "subject" VARCHAR(200) NOT NULL,
ADD COLUMN     "termsAndConditions" TEXT NOT NULL,
ADD COLUMN     "toAuthority" VARCHAR(100) NOT NULL,
ADD COLUMN     "workItems" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "EMDTracking" ADD COLUMN     "paymentMode" VARCHAR(20) NOT NULL,
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "LOA" DROP COLUMN "offerId";
