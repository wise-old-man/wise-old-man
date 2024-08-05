-- AlterEnum
ALTER TYPE "metric" ADD VALUE 'araxxor';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "araxxor" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "araxxorKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "araxxorRank" INTEGER NOT NULL DEFAULT -1;
