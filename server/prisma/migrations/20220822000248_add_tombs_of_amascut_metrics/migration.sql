-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "metric" ADD VALUE 'tombs_of_amascut';
ALTER TYPE "metric" ADD VALUE 'tombs_of_amascut_expert';

-- AlterTable
ALTER TABLE "deltas" ADD COLUMN     "tombs_of_amascut" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tombs_of_amascut_expert" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "snapshots" ADD COLUMN     "tombs_of_amascutKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "tombs_of_amascutRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "tombs_of_amascut_expertKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "tombs_of_amascut_expertRank" INTEGER NOT NULL DEFAULT -1;
