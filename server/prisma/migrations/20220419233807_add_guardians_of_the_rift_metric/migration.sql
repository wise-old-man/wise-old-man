-- AlterEnum
ALTER TYPE "enum_records_metric" ADD VALUE 'guardians_of_the_rift';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "guardians_of_the_rift" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "guardians_of_the_riftRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "guardians_of_the_riftScore" INTEGER NOT NULL DEFAULT -1;
