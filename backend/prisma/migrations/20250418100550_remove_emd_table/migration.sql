/*
  Warnings:

  - You are about to drop the `EMD` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EMD" DROP CONSTRAINT "EMD_loaId_fkey";

-- DropForeignKey
ALTER TABLE "EMD" DROP CONSTRAINT "EMD_offerId_fkey";

-- DropTable
DROP TABLE "EMD";

-- DropEnum
DROP TYPE "EMDStatus";
