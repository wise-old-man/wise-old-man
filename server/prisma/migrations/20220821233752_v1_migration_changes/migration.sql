/*
  Warnings:

  - The `type` column on the `competitions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `period` column on the `deltas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `memberships` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `nameChanges` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `players` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `build` column on the `players` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `country` column on the `players` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `metric` on the `achievements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `metric` on the `competitions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `createdAt` on table `participations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `participations` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `period` on the `records` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `metric` on the `records` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "name_change_status" AS ENUM ('pending', 'denied', 'approved');

-- CreateEnum
CREATE TYPE "player_type" AS ENUM ('unknown', 'regular', 'ironman', 'hardcore', 'ultimate');

-- CreateEnum
CREATE TYPE "player_build" AS ENUM ('main', 'f2p', 'lvl3', 'zerker', 'def1', 'hp10');

-- CreateEnum
CREATE TYPE "country" AS ENUM ('AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW');

-- CreateEnum
CREATE TYPE "competition_type" AS ENUM ('classic', 'team');

-- CreateEnum
CREATE TYPE "group_role" AS ENUM ('achiever', 'adamant', 'adept', 'administrator', 'admiral', 'adventurer', 'air', 'anchor', 'apothecary', 'archer', 'armadylean', 'artillery', 'artisan', 'asgarnian', 'assassin', 'assistant', 'astral', 'athlete', 'attacker', 'bandit', 'bandosian', 'barbarian', 'battlemage', 'beast', 'berserker', 'blisterwood', 'blood', 'blue', 'bob', 'body', 'brassican', 'brawler', 'brigadier', 'brigand', 'bronze', 'bruiser', 'bulwark', 'burglar', 'burnt', 'cadet', 'captain', 'carry', 'champion', 'chaos', 'cleric', 'collector', 'colonel', 'commander', 'competitor', 'completionist', 'constructor', 'cook', 'coordinator', 'corporal', 'cosmic', 'councillor', 'crafter', 'crew', 'crusader', 'cutpurse', 'death', 'defender', 'defiler', 'deputy_owner', 'destroyer', 'diamond', 'diseased', 'doctor', 'dogsbody', 'dragon', 'dragonstone', 'druid', 'duellist', 'earth', 'elite', 'emerald', 'enforcer', 'epic', 'executive', 'expert', 'explorer', 'farmer', 'feeder', 'fighter', 'fire', 'firemaker', 'firestarter', 'fisher', 'fletcher', 'forager', 'fremennik', 'gamer', 'gatherer', 'general', 'gnome_child', 'gnome_elder', 'goblin', 'gold', 'goon', 'green', 'grey', 'guardian', 'guthixian', 'harpoon', 'healer', 'hellcat', 'helper', 'herbologist', 'hero', 'holy', 'hoarder', 'hunter', 'ignitor', 'illusionist', 'imp', 'infantry', 'inquisitor', 'iron', 'jade', 'justiciar', 'kandarin', 'karamjan', 'kharidian', 'kitten', 'knight', 'labourer', 'law', 'leader', 'learner', 'legacy', 'legend', 'legionnaire', 'lieutenant', 'looter', 'lumberjack', 'magic', 'magician', 'major', 'maple', 'marshal', 'master', 'maxed', 'mediator', 'medic', 'mentor', 'member', 'merchant', 'mind', 'miner', 'minion', 'misthalinian', 'mithril', 'moderator', 'monarch', 'morytanian', 'mystic', 'myth', 'natural', 'nature', 'necromancer', 'ninja', 'noble', 'novice', 'nurse', 'oak', 'officer', 'onyx', 'opal', 'oracle', 'orange', 'owner', 'page', 'paladin', 'pawn', 'pilgrim', 'pine', 'pink', 'prefect', 'priest', 'private', 'prodigy', 'proselyte', 'prospector', 'protector', 'pure', 'purple', 'pyromancer', 'quester', 'racer', 'raider', 'ranger', 'record_chaser', 'recruit', 'recruiter', 'red_topaz', 'red', 'rogue', 'ruby', 'rune', 'runecrafter', 'sage', 'sapphire', 'saradominist', 'saviour', 'scavenger', 'scholar', 'scourge', 'scout', 'scribe', 'seer', 'senator', 'sentry', 'serenist', 'sergeant', 'shaman', 'sheriff', 'short_green_guy', 'skiller', 'skulled', 'slayer', 'smiter', 'smith', 'smuggler', 'sniper', 'soul', 'specialist', 'speed_runner', 'spellcaster', 'squire', 'staff', 'steel', 'strider', 'striker', 'summoner', 'superior', 'supervisor', 'teacher', 'templar', 'therapist', 'thief', 'tirannian', 'trialist', 'trickster', 'tzkal', 'tztok', 'unholy', 'vagrant', 'vanguard', 'walker', 'wanderer', 'warden', 'warlock', 'warrior', 'water', 'wild', 'willow', 'wily', 'wintumber', 'witch', 'wizard', 'worker', 'wrath', 'xerician', 'yellow', 'yew', 'zamorakian', 'zarosian', 'zealot', 'zenyte');

-- CreateEnum
CREATE TYPE "period" AS ENUM ('day', 'week', 'month', 'year', 'five_min');

-- CreateEnum
CREATE TYPE "metric" AS ENUM ('overall', 'attack', 'defence', 'strength', 'hitpoints', 'ranged', 'prayer', 'magic', 'cooking', 'woodcutting', 'fletching', 'fishing', 'firemaking', 'crafting', 'smithing', 'mining', 'herblore', 'agility', 'thieving', 'slayer', 'farming', 'runecrafting', 'hunter', 'construction', 'league_points', 'bounty_hunter_hunter', 'bounty_hunter_rogue', 'clue_scrolls_all', 'clue_scrolls_beginner', 'clue_scrolls_easy', 'clue_scrolls_medium', 'clue_scrolls_hard', 'clue_scrolls_elite', 'clue_scrolls_master', 'last_man_standing', 'pvp_arena', 'abyssal_sire', 'alchemical_hydra', 'barrows_chests', 'bryophyta', 'callisto', 'cerberus', 'chambers_of_xeric', 'chambers_of_xeric_challenge_mode', 'chaos_elemental', 'chaos_fanatic', 'commander_zilyana', 'corporeal_beast', 'crazy_archaeologist', 'dagannoth_prime', 'dagannoth_rex', 'dagannoth_supreme', 'deranged_archaeologist', 'general_graardor', 'giant_mole', 'grotesque_guardians', 'hespori', 'kalphite_queen', 'king_black_dragon', 'kraken', 'kreearra', 'kril_tsutsaroth', 'mimic', 'nex', 'nightmare', 'obor', 'sarachnis', 'scorpia', 'skotizo', 'the_gauntlet', 'the_corrupted_gauntlet', 'theatre_of_blood', 'thermonuclear_smoke_devil', 'tzkal_zuk', 'tztok_jad', 'venenatis', 'vetion', 'vorkath', 'wintertodt', 'zalcano', 'zulrah', 'ehp', 'ehb', 'soul_wars_zeal', 'tempoross', 'theatre_of_blood_hard_mode', 'phosanis_nightmare', 'guardians_of_the_rift');

-- DropIndex
DROP INDEX "records_player_id_period";

-- DropIndex
DROP INDEX "records_player_id_period_metric";

-- AlterTable
ALTER TABLE "achievements" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
DROP COLUMN "metric",
ADD COLUMN     "metric" "metric" NOT NULL;

-- AlterTable
ALTER TABLE "competitions" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6),
DROP COLUMN "metric",
ADD COLUMN     "metric" "metric" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "competition_type" NOT NULL DEFAULT 'classic';

-- AlterTable
ALTER TABLE "deltas" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6),
DROP COLUMN "period",
ADD COLUMN     "period" "period" NOT NULL DEFAULT 'day';

-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6),
DROP COLUMN "role",
ADD COLUMN     "role" "group_role" NOT NULL DEFAULT 'member';

-- AlterTable
ALTER TABLE "nameChanges" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
DROP COLUMN "status",
ADD COLUMN     "status" "name_change_status" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "participations" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "players" DROP COLUMN "type",
ADD COLUMN     "type" "player_type" NOT NULL DEFAULT 'unknown',
ALTER COLUMN "registeredAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6),
DROP COLUMN "build",
ADD COLUMN     "build" "player_build" NOT NULL DEFAULT 'main',
DROP COLUMN "country",
ADD COLUMN     "country" "country";

-- AlterTable
ALTER TABLE "records" DROP COLUMN "period",
ADD COLUMN     "period" "period" NOT NULL,
DROP COLUMN "metric",
ADD COLUMN     "metric" "metric" NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "snapshots" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6);

-- DropEnum
DROP TYPE "CompetitionType";

-- DropEnum
DROP TYPE "Country";

-- DropEnum
DROP TYPE "GroupRole";

-- DropEnum
DROP TYPE "NameChangeStatus";

-- DropEnum
DROP TYPE "PlayerBuild";

-- DropEnum
DROP TYPE "enum_players_type";

-- DropEnum
DROP TYPE "enum_records_metric";

-- DropEnum
DROP TYPE "enum_records_period";

-- CreateIndex
CREATE INDEX "competitions_metric" ON "competitions"("metric");

-- CreateIndex
CREATE INDEX "deltas_period" ON "deltas"("period");

-- CreateIndex
CREATE INDEX "players_type" ON "players"("type");

-- CreateIndex
CREATE INDEX "records_metric" ON "records"("metric");

-- CreateIndex
CREATE INDEX "records_period" ON "records"("period");
