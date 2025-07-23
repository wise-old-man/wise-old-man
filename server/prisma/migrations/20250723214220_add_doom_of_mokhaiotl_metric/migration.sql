-- AlterEnum
ALTER TYPE "metric" ADD VALUE 'doom_of_mokhaiotl';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "doom_of_mokhaiotl" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "doom_of_mokhaiotlKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "doom_of_mokhaiotlRank" INTEGER NOT NULL DEFAULT -1;
