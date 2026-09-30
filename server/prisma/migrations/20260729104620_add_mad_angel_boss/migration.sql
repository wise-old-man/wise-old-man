-- AlterEnum
ALTER TYPE "public"."metric" ADD VALUE 'mad_angel';

-- AlterTable
ALTER TABLE "public"."snapshots" ADD COLUMN     "mad_angelKills" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "mad_angelRank" INTEGER NOT NULL DEFAULT -1;
