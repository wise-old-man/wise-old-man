-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "metric" ADD VALUE 'the_royal_titans';
ALTER TYPE "metric" ADD VALUE 'yama';
ALTER TYPE "metric" ADD VALUE 'collections_logged';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "collections_logged" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "the_royal_titans" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "yama" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "collections_loggedRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "collections_loggedScore" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_royal_titansKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_royal_titansRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "yamaKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "yamaRank" INTEGER NOT NULL DEFAULT -1;
