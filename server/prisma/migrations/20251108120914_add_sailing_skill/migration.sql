-- AlterEnum
ALTER TYPE "public"."metric" ADD VALUE 'sailing';

-- AlterTable
ALTER TABLE "public"."snapshots" ADD COLUMN     "sailingExperience" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "sailingRank" INTEGER NOT NULL DEFAULT -1;
