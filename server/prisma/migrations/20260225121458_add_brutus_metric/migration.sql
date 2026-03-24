-- AlterEnum
ALTER TYPE "public"."metric" ADD VALUE 'brutus';

-- AlterTable
ALTER TABLE "public"."snapshots" ADD COLUMN     "brutusKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "brutusRank" INTEGER NOT NULL DEFAULT -1;
