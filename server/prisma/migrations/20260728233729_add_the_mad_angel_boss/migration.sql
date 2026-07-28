-- AlterEnum
ALTER TYPE "public"."metric" ADD VALUE 'the_mad_angel';

-- AlterTable
ALTER TABLE "public"."snapshots" ADD COLUMN     "the_mad_angelKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_mad_angelRank" INTEGER NOT NULL DEFAULT -1;
