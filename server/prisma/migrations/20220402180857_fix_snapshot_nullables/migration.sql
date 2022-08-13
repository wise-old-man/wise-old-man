/*
  Warnings:

  - Made the column `overallRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `overallExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `attackRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `attackExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `defenceRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `defenceExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `strengthRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `strengthExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hitpointsRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hitpointsExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rangedRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rangedExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prayerRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prayerExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `magicRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `magicExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cookingRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cookingExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `woodcuttingRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `woodcuttingExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fletchingRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fletchingExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fishingRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fishingExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firemakingRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firemakingExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `craftingRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `craftingExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `smithingRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `smithingExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `miningRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `miningExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `herbloreRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `herbloreExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `agilityRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `agilityExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thievingRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thievingExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slayerRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slayerExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `farmingRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `farmingExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `runecraftingRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `runecraftingExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hunterRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hunterExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `constructionRank` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `constructionExperience` on table `snapshots` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `snapshots` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "snapshots" ALTER COLUMN "overallRank" SET NOT NULL,
ALTER COLUMN "overallRank" SET DEFAULT -1,
ALTER COLUMN "overallExperience" SET NOT NULL,
ALTER COLUMN "overallExperience" SET DEFAULT -1,
ALTER COLUMN "attackRank" SET NOT NULL,
ALTER COLUMN "attackRank" SET DEFAULT -1,
ALTER COLUMN "attackExperience" SET NOT NULL,
ALTER COLUMN "attackExperience" SET DEFAULT -1,
ALTER COLUMN "defenceRank" SET NOT NULL,
ALTER COLUMN "defenceRank" SET DEFAULT -1,
ALTER COLUMN "defenceExperience" SET NOT NULL,
ALTER COLUMN "defenceExperience" SET DEFAULT -1,
ALTER COLUMN "strengthRank" SET NOT NULL,
ALTER COLUMN "strengthRank" SET DEFAULT -1,
ALTER COLUMN "strengthExperience" SET NOT NULL,
ALTER COLUMN "strengthExperience" SET DEFAULT -1,
ALTER COLUMN "hitpointsRank" SET NOT NULL,
ALTER COLUMN "hitpointsRank" SET DEFAULT -1,
ALTER COLUMN "hitpointsExperience" SET NOT NULL,
ALTER COLUMN "hitpointsExperience" SET DEFAULT -1,
ALTER COLUMN "rangedRank" SET NOT NULL,
ALTER COLUMN "rangedRank" SET DEFAULT -1,
ALTER COLUMN "rangedExperience" SET NOT NULL,
ALTER COLUMN "rangedExperience" SET DEFAULT -1,
ALTER COLUMN "prayerRank" SET NOT NULL,
ALTER COLUMN "prayerRank" SET DEFAULT -1,
ALTER COLUMN "prayerExperience" SET NOT NULL,
ALTER COLUMN "prayerExperience" SET DEFAULT -1,
ALTER COLUMN "magicRank" SET NOT NULL,
ALTER COLUMN "magicRank" SET DEFAULT -1,
ALTER COLUMN "magicExperience" SET NOT NULL,
ALTER COLUMN "magicExperience" SET DEFAULT -1,
ALTER COLUMN "cookingRank" SET NOT NULL,
ALTER COLUMN "cookingRank" SET DEFAULT -1,
ALTER COLUMN "cookingExperience" SET NOT NULL,
ALTER COLUMN "cookingExperience" SET DEFAULT -1,
ALTER COLUMN "woodcuttingRank" SET NOT NULL,
ALTER COLUMN "woodcuttingRank" SET DEFAULT -1,
ALTER COLUMN "woodcuttingExperience" SET NOT NULL,
ALTER COLUMN "woodcuttingExperience" SET DEFAULT -1,
ALTER COLUMN "fletchingRank" SET NOT NULL,
ALTER COLUMN "fletchingRank" SET DEFAULT -1,
ALTER COLUMN "fletchingExperience" SET NOT NULL,
ALTER COLUMN "fletchingExperience" SET DEFAULT -1,
ALTER COLUMN "fishingRank" SET NOT NULL,
ALTER COLUMN "fishingRank" SET DEFAULT -1,
ALTER COLUMN "fishingExperience" SET NOT NULL,
ALTER COLUMN "fishingExperience" SET DEFAULT -1,
ALTER COLUMN "firemakingRank" SET NOT NULL,
ALTER COLUMN "firemakingRank" SET DEFAULT -1,
ALTER COLUMN "firemakingExperience" SET NOT NULL,
ALTER COLUMN "firemakingExperience" SET DEFAULT -1,
ALTER COLUMN "craftingRank" SET NOT NULL,
ALTER COLUMN "craftingRank" SET DEFAULT -1,
ALTER COLUMN "craftingExperience" SET NOT NULL,
ALTER COLUMN "craftingExperience" SET DEFAULT -1,
ALTER COLUMN "smithingRank" SET NOT NULL,
ALTER COLUMN "smithingRank" SET DEFAULT -1,
ALTER COLUMN "smithingExperience" SET NOT NULL,
ALTER COLUMN "smithingExperience" SET DEFAULT -1,
ALTER COLUMN "miningRank" SET NOT NULL,
ALTER COLUMN "miningRank" SET DEFAULT -1,
ALTER COLUMN "miningExperience" SET NOT NULL,
ALTER COLUMN "miningExperience" SET DEFAULT -1,
ALTER COLUMN "herbloreRank" SET NOT NULL,
ALTER COLUMN "herbloreRank" SET DEFAULT -1,
ALTER COLUMN "herbloreExperience" SET NOT NULL,
ALTER COLUMN "herbloreExperience" SET DEFAULT -1,
ALTER COLUMN "agilityRank" SET NOT NULL,
ALTER COLUMN "agilityRank" SET DEFAULT -1,
ALTER COLUMN "agilityExperience" SET NOT NULL,
ALTER COLUMN "agilityExperience" SET DEFAULT -1,
ALTER COLUMN "thievingRank" SET NOT NULL,
ALTER COLUMN "thievingRank" SET DEFAULT -1,
ALTER COLUMN "thievingExperience" SET NOT NULL,
ALTER COLUMN "thievingExperience" SET DEFAULT -1,
ALTER COLUMN "slayerRank" SET NOT NULL,
ALTER COLUMN "slayerRank" SET DEFAULT -1,
ALTER COLUMN "slayerExperience" SET NOT NULL,
ALTER COLUMN "slayerExperience" SET DEFAULT -1,
ALTER COLUMN "farmingRank" SET NOT NULL,
ALTER COLUMN "farmingRank" SET DEFAULT -1,
ALTER COLUMN "farmingExperience" SET NOT NULL,
ALTER COLUMN "farmingExperience" SET DEFAULT -1,
ALTER COLUMN "runecraftingRank" SET NOT NULL,
ALTER COLUMN "runecraftingRank" SET DEFAULT -1,
ALTER COLUMN "runecraftingExperience" SET NOT NULL,
ALTER COLUMN "runecraftingExperience" SET DEFAULT -1,
ALTER COLUMN "hunterRank" SET NOT NULL,
ALTER COLUMN "hunterRank" SET DEFAULT -1,
ALTER COLUMN "hunterExperience" SET NOT NULL,
ALTER COLUMN "hunterExperience" SET DEFAULT -1,
ALTER COLUMN "constructionRank" SET NOT NULL,
ALTER COLUMN "constructionRank" SET DEFAULT -1,
ALTER COLUMN "constructionExperience" SET NOT NULL,
ALTER COLUMN "constructionExperience" SET DEFAULT -1,
ALTER COLUMN "createdAt" SET NOT NULL;
