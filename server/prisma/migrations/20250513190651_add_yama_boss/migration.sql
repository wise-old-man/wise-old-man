-- AlterEnum
ALTER TYPE "metric" ADD VALUE 'yama';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "yama" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "yamaKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "yamaRank" INTEGER NOT NULL DEFAULT -1;
