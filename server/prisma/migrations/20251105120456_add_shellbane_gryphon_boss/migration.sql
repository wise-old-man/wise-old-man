-- AlterEnum
ALTER TYPE "public"."metric" ADD VALUE 'shellbane_gryphon';

-- AlterTable
ALTER TABLE "public"."snapshots" ADD COLUMN     "shellbane_gryphonKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "shellbane_gryphonRank" INTEGER NOT NULL DEFAULT -1;
