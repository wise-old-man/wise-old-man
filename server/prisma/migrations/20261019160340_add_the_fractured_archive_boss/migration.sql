-- AlterEnum
ALTER TYPE "public"."metric" ADD VALUE 'the_fractured_archive';

-- AlterTable
ALTER TABLE "public"."snapshots" ADD COLUMN     "the_fractured_archiveKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "the_fractured_archiveRank" INTEGER NOT NULL DEFAULT -1;
