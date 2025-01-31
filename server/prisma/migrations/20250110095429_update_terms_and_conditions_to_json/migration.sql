/*
  Warnings:

  - Changed the type of `termsAndConditions` on the `BudgetaryOffer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "BudgetaryOffer" DROP COLUMN "termsAndConditions",
ADD COLUMN     "termsAndConditions" JSONB NOT NULL;
