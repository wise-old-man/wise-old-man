-- AlterEnum
ALTER TYPE "metric" ADD VALUE 'hueycoatl';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "hueycoatl" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "hueycoatlKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "hueycoatlRank" INTEGER NOT NULL DEFAULT -1;
