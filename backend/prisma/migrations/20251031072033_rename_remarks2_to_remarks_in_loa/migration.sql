-- AlterTable: Rename remarks2 column to remarks in LOA table
-- This migration renames the column while preserving all existing data
ALTER TABLE "LOA" RENAME COLUMN "remarks2" TO "remarks";
