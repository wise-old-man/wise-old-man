-- AlterEnum
ALTER TYPE "metric" ADD VALUE 'royal_titans';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "royal_titans" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "royalTitansKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "royal_titansRank" INTEGER NOT NULL DEFAULT -1;
