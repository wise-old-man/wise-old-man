-- AlterEnum
ALTER TYPE "metric" ADD VALUE 'phantom_muspah';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "phantom_muspah" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "phantom_muspahKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "phantom_muspahRank" INTEGER NOT NULL DEFAULT -1;
