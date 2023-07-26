-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "metric" ADD VALUE 'duke_sucellus';
ALTER TYPE "metric" ADD VALUE 'the_leviathan';
ALTER TYPE "metric" ADD VALUE 'the_whisperer';
ALTER TYPE "metric" ADD VALUE 'vardorvis';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "duke_sucellus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "the_leviathan" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "the_whisperer" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vardorvis" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "duke_sucellusKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "duke_sucellusRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_leviathanKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_leviathanRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_whispererKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_whispererRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "vardorvisKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "vardorvisRank" INTEGER NOT NULL DEFAULT -1;
