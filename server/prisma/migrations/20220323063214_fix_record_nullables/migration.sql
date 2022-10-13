/*
  Warnings:

  - The values [bounter_hunter_hunter,bounter_hunter_rogue] on the enum `enum_records_metric` will be removed. If these variants are still used in the database, this will fail.
  - The values [6h,5min] on the enum `enum_records_period` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `value` on table `records` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `records` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "enum_records_metric_new" AS ENUM ('overall', 'attack', 'defence', 'strength', 'hitpoints', 'ranged', 'prayer', 'magic', 'cooking', 'woodcutting', 'fletching', 'fishing', 'firemaking', 'crafting', 'smithing', 'mining', 'herblore', 'agility', 'thieving', 'slayer', 'farming', 'runecrafting', 'hunter', 'construction', 'league_points', 'bounty_hunter_hunter', 'bounty_hunter_rogue', 'clue_scrolls_all', 'clue_scrolls_beginner', 'clue_scrolls_easy', 'clue_scrolls_medium', 'clue_scrolls_hard', 'clue_scrolls_elite', 'clue_scrolls_master', 'last_man_standing', 'abyssal_sire', 'alchemical_hydra', 'barrows_chests', 'bryophyta', 'callisto', 'cerberus', 'chambers_of_xeric', 'chambers_of_xeric_challenge_mode', 'chaos_elemental', 'chaos_fanatic', 'commander_zilyana', 'corporeal_beast', 'crazy_archaeologist', 'dagannoth_prime', 'dagannoth_rex', 'dagannoth_supreme', 'deranged_archaeologist', 'general_graardor', 'giant_mole', 'grotesque_guardians', 'hespori', 'kalphite_queen', 'king_black_dragon', 'kraken', 'kreearra', 'kril_tsutsaroth', 'mimic', 'nex', 'nightmare', 'obor', 'sarachnis', 'scorpia', 'skotizo', 'the_gauntlet', 'the_corrupted_gauntlet', 'theatre_of_blood', 'thermonuclear_smoke_devil', 'tzkal_zuk', 'tztok_jad', 'venenatis', 'vetion', 'vorkath', 'wintertodt', 'zalcano', 'zulrah', 'ehp', 'ehb', 'soul_wars_zeal', 'tempoross', 'theatre_of_blood_hard_mode', 'phosanis_nightmare');
ALTER TABLE "achievements" ALTER COLUMN "metric" TYPE "enum_records_metric_new" USING ("metric"::text::"enum_records_metric_new");
ALTER TABLE "records" ALTER COLUMN "metric" TYPE "enum_records_metric_new" USING ("metric"::text::"enum_records_metric_new");
ALTER TYPE "enum_records_metric" RENAME TO "enum_records_metric_old";
ALTER TYPE "enum_records_metric_new" RENAME TO "enum_records_metric";
DROP TYPE "enum_records_metric_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "enum_records_period_new" AS ENUM ('day', 'week', 'month', 'year', 'five_min');
ALTER TABLE "records" ALTER COLUMN "period" TYPE "enum_records_period_new" USING ("period"::text::"enum_records_period_new");
ALTER TYPE "enum_records_period" RENAME TO "enum_records_period_old";
ALTER TYPE "enum_records_period_new" RENAME TO "enum_records_period";
DROP TYPE "enum_records_period_old";
COMMIT;

-- AlterTable
ALTER TABLE "records" ALTER COLUMN "value" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
