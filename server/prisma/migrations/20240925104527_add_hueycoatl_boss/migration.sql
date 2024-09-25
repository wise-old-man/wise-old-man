-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "metric" ADD VALUE 'amoxliatl';
ALTER TYPE "metric" ADD VALUE 'the_hueycoatl';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "amoxliatl" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "the_hueycoatl" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "amoxliatlKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "amoxliatlRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_hueycoatlKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_hueycoatlRank" INTEGER NOT NULL DEFAULT -1;
