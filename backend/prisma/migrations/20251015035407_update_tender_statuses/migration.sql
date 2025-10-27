/*
  Warnings:

  - The values [DRAFT,ACTIVE,COMPLETED,CANCELLED,DELAYED] on the enum `LOAStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE,CANCELLED,AWARDED] on the enum `TenderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LOAStatus_new" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUPPLY_WORK_COMPLETED', 'CHASE_PAYMENT', 'CLOSED');
ALTER TABLE "LOA" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "LOA" ALTER COLUMN "status" TYPE "LOAStatus_new" USING ("status"::text::"LOAStatus_new");
ALTER TYPE "LOAStatus" RENAME TO "LOAStatus_old";
ALTER TYPE "LOAStatus_new" RENAME TO "LOAStatus";
DROP TYPE "LOAStatus_old";
ALTER TABLE "LOA" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TenderStatus_new" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUPPLY_WORK_DELAYED', 'SUPPLY_WORK_COMPLETED', 'APPLICATION_PENDING', 'UPLOAD_BILL', 'CHASE_PAYMENT', 'RETRIEVE_EMD_SECURITY', 'CLOSED');
ALTER TABLE "Tender" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Tender" ALTER COLUMN "status" TYPE "TenderStatus_new" USING ("status"::text::"TenderStatus_new");
ALTER TYPE "TenderStatus" RENAME TO "TenderStatus_old";
ALTER TYPE "TenderStatus_new" RENAME TO "TenderStatus";
DROP TYPE "TenderStatus_old";
ALTER TABLE "Tender" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
COMMIT;

-- AlterTable
ALTER TABLE "LOA" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "Tender" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
