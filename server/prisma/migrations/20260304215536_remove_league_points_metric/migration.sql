/*
  Warnings:

  - You are about to drop the column `league_pointsRank` on the `snapshots` table. All the data in the column will be lost.
  - You are about to drop the column `league_pointsScore` on the `snapshots` table. All the data in the column will be lost.

*/

-- AlterTable
ALTER TABLE "public"."snapshots" DROP COLUMN "league_pointsRank",
DROP COLUMN "league_pointsScore";
