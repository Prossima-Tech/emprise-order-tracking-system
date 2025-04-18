/*
  Warnings:

  - You are about to drop the column `emdAmount` on the `LOA` table. All the data in the column will be lost.
  - You are about to drop the column `hasEmd` on the `LOA` table. All the data in the column will be lost.
  - You are about to drop the column `hasPerformanceGuarantee` on the `LOA` table. All the data in the column will be lost.
  - You are about to drop the column `hasSecurityDeposit` on the `LOA` table. All the data in the column will be lost.
  - You are about to drop the column `performanceGuaranteeAmount` on the `LOA` table. All the data in the column will be lost.
  - You are about to drop the column `performanceGuaranteeDocumentUrl` on the `LOA` table. All the data in the column will be lost.
  - You are about to drop the column `securityDepositAmount` on the `LOA` table. All the data in the column will be lost.
  - You are about to drop the column `securityDepositDocumentUrl` on the `LOA` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LOA" DROP COLUMN "emdAmount",
DROP COLUMN "hasEmd",
DROP COLUMN "hasPerformanceGuarantee",
DROP COLUMN "hasSecurityDeposit",
DROP COLUMN "performanceGuaranteeAmount",
DROP COLUMN "performanceGuaranteeDocumentUrl",
DROP COLUMN "securityDepositAmount",
DROP COLUMN "securityDepositDocumentUrl";
