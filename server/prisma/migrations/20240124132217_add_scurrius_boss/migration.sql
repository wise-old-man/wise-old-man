-- AlterEnum
ALTER TYPE "metric" ADD VALUE 'scurrius';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "scurrius" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "scurriusKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "scurriusRank" INTEGER NOT NULL DEFAULT -1;
