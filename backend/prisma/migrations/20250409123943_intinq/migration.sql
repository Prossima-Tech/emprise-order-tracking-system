/*
  Warnings:

  - You are about to drop the column `railwayZone` on the `BudgetaryOffer` table. All the data in the column will be lost.
  - You are about to drop the `railway_zones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Site" DROP CONSTRAINT "Site_zoneId_fkey";

-- AlterTable
ALTER TABLE "BudgetaryOffer" DROP COLUMN "railwayZone",
ADD COLUMN     "customerId" TEXT DEFAULT 'CR';

-- DropTable
DROP TABLE "railway_zones";

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headquarters" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
