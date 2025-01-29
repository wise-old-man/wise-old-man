-- AlterEnum
ALTER TYPE "metric" ADD VALUE 'collections_logged';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "collections_logged" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "collections_loggedRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "collections_loggedScore" INTEGER NOT NULL DEFAULT -1;
