-- AlterEnum
ALTER TYPE "public"."metric" ADD VALUE 'maggot_king';

-- AlterTable
ALTER TABLE "public"."snapshots" ADD COLUMN     "maggot_kingKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "maggot_kingRank" INTEGER NOT NULL DEFAULT -1;
