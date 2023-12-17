-- AlterTable
ALTER TABLE "playerArchives" ADD COLUMN     "restoredAt" TIMESTAMPTZ(6),
ADD COLUMN     "restoredUsername" VARCHAR(12);
