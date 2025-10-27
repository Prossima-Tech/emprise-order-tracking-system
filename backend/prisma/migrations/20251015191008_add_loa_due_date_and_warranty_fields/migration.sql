-- AlterTable: Add due date and warranty period fields to LOA
ALTER TABLE "LOA" ADD COLUMN "dueDate" TIMESTAMP(3),
ADD COLUMN "warrantyPeriodMonths" INTEGER,
ADD COLUMN "warrantyPeriodYears" INTEGER,
ADD COLUMN "warrantyStartDate" TIMESTAMP(3),
ADD COLUMN "warrantyEndDate" TIMESTAMP(3);

-- CreateIndex: Add index on dueDate for better query performance
CREATE INDEX "LOA_dueDate_idx" ON "LOA"("dueDate");
