-- AlterEnum: Update TenderStatus to client requirements
-- New statuses: ACTIVE, RETENDERED, CANCELLED, AWARDED, NOT_AWARDED
-- Old statuses: ACTIVE, CLOSED, CANCELLED, AWARDED

-- Step 1: Create the new enum type with client-required values
CREATE TYPE "TenderStatus_new" AS ENUM ('ACTIVE', 'RETENDERED', 'CANCELLED', 'AWARDED', 'NOT_AWARDED');

-- Step 2: Add a temporary column with the new type
ALTER TABLE "Tender" ADD COLUMN "status_new" "TenderStatus_new";

-- Step 3: Migrate data - map old statuses to new ones
-- Keep ACTIVE, CANCELLED, AWARDED as-is
UPDATE "Tender" SET "status_new" = status::text::"TenderStatus_new"
WHERE status IN ('ACTIVE', 'CANCELLED', 'AWARDED');

-- Map CLOSED to ACTIVE (assuming closed tenders should be considered active for now)
-- You can change this to 'NOT_AWARDED' if that makes more sense for your use case
UPDATE "Tender" SET "status_new" = 'ACTIVE'
WHERE status = 'CLOSED';

-- Step 4: Drop the old column
ALTER TABLE "Tender" DROP COLUMN "status";

-- Step 5: Rename the new column
ALTER TABLE "Tender" RENAME COLUMN "status_new" TO "status";

-- Step 6: Set the default value
ALTER TABLE "Tender" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- Step 7: Drop the old enum type
DROP TYPE "TenderStatus";

-- Step 8: Rename the new enum type
ALTER TYPE "TenderStatus_new" RENAME TO "TenderStatus";
