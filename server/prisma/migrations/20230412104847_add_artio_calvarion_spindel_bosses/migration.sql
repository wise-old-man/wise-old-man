-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "metric" ADD VALUE 'artio';
ALTER TYPE "metric" ADD VALUE 'calvarion';
ALTER TYPE "metric" ADD VALUE 'spindel';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "artio" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "calvarion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spindel" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "artioKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "artioRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "calvarionKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "calvarionRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "spindelKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "spindelRank" INTEGER NOT NULL DEFAULT -1;
