-- AlterTable
ALTER TABLE "public"."players" ADD COLUMN     "leaguePoints" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."snapshots" ADD COLUMN     "league_pointsRank" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "league_pointsScore" INTEGER NOT NULL DEFAULT -1;
