-- AlterEnum
ALTER TYPE "metric" ADD VALUE 'the_royal_titans';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "the_royal_titans" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "the_royalTitansKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_royal_titansRank" INTEGER NOT NULL DEFAULT -1;
