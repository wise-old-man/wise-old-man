-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "metric" ADD VALUE 'lunar_chests';
ALTER TYPE "metric" ADD VALUE 'sol_heredit';
ALTER TYPE "metric" ADD VALUE 'colosseum_glory';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "colosseum_glory" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lunar_chests" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sol_heredit" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "colosseum_gloryRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "colosseum_gloryScore" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "lunar_chestsKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "lunar_chestsRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "sol_hereditKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "sol_hereditRank" INTEGER NOT NULL DEFAULT -1;
