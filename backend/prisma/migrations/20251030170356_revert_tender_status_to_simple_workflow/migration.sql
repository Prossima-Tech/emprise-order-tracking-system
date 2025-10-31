-- AlterEnum: Revert TenderStatus to simple workflow (ACTIVE, CLOSED, CANCELLED, AWARDED)
-- This is needed because Tender is pre-award stage, while LOA/PO use the detailed 9-step workflow

-- Step 1: Create the new enum type
CREATE TYPE "TenderStatus_new" AS ENUM ('ACTIVE', 'CLOSED', 'CANCELLED', 'AWARDED');

-- Step 2: Add a temporary column with the new type
ALTER TABLE "Tender" ADD COLUMN "status_new" "TenderStatus_new";

-- Step 3: Migrate data - map old statuses to new ones
UPDATE "Tender" SET "status_new" = 'ACTIVE'
WHERE status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUPPLY_WORK_DELAYED', 'SUPPLY_WORK_COMPLETED', 'APPLICATION_PENDING', 'UPLOAD_BILL', 'CHASE_PAYMENT', 'RETRIEVE_EMD_SECURITY');

UPDATE "Tender" SET "status_new" = 'CLOSED'
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
