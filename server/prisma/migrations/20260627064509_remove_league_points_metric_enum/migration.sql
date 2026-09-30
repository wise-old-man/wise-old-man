/*
  Warnings:

  - The values [league_points] on the enum `metric` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."metric_new" AS ENUM ('overall', 'attack', 'defence', 'strength', 'hitpoints', 'ranged', 'prayer', 'magic', 'cooking', 'woodcutting', 'fletching', 'fishing', 'firemaking', 'crafting', 'smithing', 'mining', 'herblore', 'agility', 'thieving', 'slayer', 'farming', 'runecrafting', 'hunter', 'construction', 'sailing', 'bounty_hunter_hunter', 'bounty_hunter_rogue', 'clue_scrolls_all', 'clue_scrolls_beginner', 'clue_scrolls_easy', 'clue_scrolls_medium', 'clue_scrolls_hard', 'clue_scrolls_elite', 'clue_scrolls_master', 'last_man_standing', 'pvp_arena', 'abyssal_sire', 'alchemical_hydra', 'amoxliatl', 'araxxor', 'artio', 'barrows_chests', 'brutus', 'bryophyta', 'callisto', 'calvarion', 'cerberus', 'chambers_of_xeric', 'chambers_of_xeric_challenge_mode', 'chaos_elemental', 'chaos_fanatic', 'commander_zilyana', 'corporeal_beast', 'crazy_archaeologist', 'dagannoth_prime', 'dagannoth_rex', 'dagannoth_supreme', 'deranged_archaeologist', 'doom_of_mokhaiotl', 'duke_sucellus', 'general_graardor', 'giant_mole', 'grotesque_guardians', 'hespori', 'kalphite_queen', 'king_black_dragon', 'kraken', 'kreearra', 'kril_tsutsaroth', 'lunar_chests', 'mimic', 'nex', 'nightmare', 'obor', 'phantom_muspah', 'sarachnis', 'scorpia', 'scurrius', 'shellbane_gryphon', 'skotizo', 'sol_heredit', 'spindel', 'the_gauntlet', 'the_hueycoatl', 'the_corrupted_gauntlet', 'the_leviathan', 'the_royal_titans', 'the_whisperer', 'theatre_of_blood', 'thermonuclear_smoke_devil', 'tombs_of_amascut', 'tombs_of_amascut_expert', 'tzkal_zuk', 'tztok_jad', 'vardorvis', 'venenatis', 'vetion', 'vorkath', 'wintertodt', 'yama', 'zalcano', 'zulrah', 'ehp', 'ehb', 'soul_wars_zeal', 'tempoross', 'theatre_of_blood_hard_mode', 'phosanis_nightmare', 'guardians_of_the_rift', 'colosseum_glory', 'collections_logged');
ALTER TABLE "public"."achievements" ALTER COLUMN "metric" TYPE "public"."metric_new" USING ("metric"::text::"public"."metric_new");
ALTER TABLE "public"."competitionMetrics" ALTER COLUMN "metric" TYPE "public"."metric_new" USING ("metric"::text::"public"."metric_new");
ALTER TABLE "public"."cachedDeltas" ALTER COLUMN "metric" TYPE "public"."metric_new" USING ("metric"::text::"public"."metric_new");
ALTER TABLE "public"."records" ALTER COLUMN "metric" TYPE "public"."metric_new" USING ("metric"::text::"public"."metric_new");
ALTER TABLE "public"."trendDatapoints" ALTER COLUMN "metric" TYPE "public"."metric_new" USING ("metric"::text::"public"."metric_new");
ALTER TYPE "public"."metric" RENAME TO "metric_old";
ALTER TYPE "public"."metric_new" RENAME TO "metric";
DROP TYPE "public"."metric_old";
COMMIT;
