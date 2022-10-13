/*
  Warnings:

  - Changed the type of `period` on the `deltas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `overall` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `attack` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `defence` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `strength` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hitpoints` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ranged` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prayer` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `magic` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cooking` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `woodcutting` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fletching` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fishing` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firemaking` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `crafting` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `smithing` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mining` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `herblore` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `agility` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thieving` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slayer` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `farming` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `runecrafting` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hunter` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `construction` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `abyssal_sire` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `alchemical_hydra` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `barrows_chests` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bryophyta` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `callisto` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cerberus` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chambers_of_xeric` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chambers_of_xeric_challenge_mode` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chaos_elemental` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chaos_fanatic` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `commander_zilyana` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `corporeal_beast` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `crazy_archaeologist` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dagannoth_prime` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dagannoth_rex` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dagannoth_supreme` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `deranged_archaeologist` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `general_graardor` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `giant_mole` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grotesque_guardians` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hespori` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kalphite_queen` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `king_black_dragon` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kraken` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kreearra` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kril_tsutsaroth` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mimic` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nightmare` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `obor` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sarachnis` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `scorpia` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `skotizo` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `the_gauntlet` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `the_corrupted_gauntlet` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `theatre_of_blood` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thermonuclear_smoke_devil` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tzkal_zuk` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tztok_jad` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `venenatis` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vetion` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vorkath` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `wintertodt` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zalcano` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zulrah` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `league_points` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bounty_hunter_hunter` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bounty_hunter_rogue` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clue_scrolls_all` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clue_scrolls_beginner` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clue_scrolls_easy` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clue_scrolls_medium` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clue_scrolls_hard` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clue_scrolls_elite` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clue_scrolls_master` on table `deltas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_man_standing` on table `deltas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "deltas" DROP COLUMN "period",
ADD COLUMN     "period" "enum_records_period" NOT NULL,
ALTER COLUMN "overall" SET NOT NULL,
ALTER COLUMN "overall" SET DEFAULT 0,
ALTER COLUMN "attack" SET NOT NULL,
ALTER COLUMN "attack" SET DEFAULT 0,
ALTER COLUMN "defence" SET NOT NULL,
ALTER COLUMN "defence" SET DEFAULT 0,
ALTER COLUMN "strength" SET NOT NULL,
ALTER COLUMN "strength" SET DEFAULT 0,
ALTER COLUMN "hitpoints" SET NOT NULL,
ALTER COLUMN "hitpoints" SET DEFAULT 0,
ALTER COLUMN "ranged" SET NOT NULL,
ALTER COLUMN "ranged" SET DEFAULT 0,
ALTER COLUMN "prayer" SET NOT NULL,
ALTER COLUMN "prayer" SET DEFAULT 0,
ALTER COLUMN "magic" SET NOT NULL,
ALTER COLUMN "magic" SET DEFAULT 0,
ALTER COLUMN "cooking" SET NOT NULL,
ALTER COLUMN "cooking" SET DEFAULT 0,
ALTER COLUMN "woodcutting" SET NOT NULL,
ALTER COLUMN "woodcutting" SET DEFAULT 0,
ALTER COLUMN "fletching" SET NOT NULL,
ALTER COLUMN "fletching" SET DEFAULT 0,
ALTER COLUMN "fishing" SET NOT NULL,
ALTER COLUMN "fishing" SET DEFAULT 0,
ALTER COLUMN "firemaking" SET NOT NULL,
ALTER COLUMN "firemaking" SET DEFAULT 0,
ALTER COLUMN "crafting" SET NOT NULL,
ALTER COLUMN "crafting" SET DEFAULT 0,
ALTER COLUMN "smithing" SET NOT NULL,
ALTER COLUMN "smithing" SET DEFAULT 0,
ALTER COLUMN "mining" SET NOT NULL,
ALTER COLUMN "mining" SET DEFAULT 0,
ALTER COLUMN "herblore" SET NOT NULL,
ALTER COLUMN "herblore" SET DEFAULT 0,
ALTER COLUMN "agility" SET NOT NULL,
ALTER COLUMN "agility" SET DEFAULT 0,
ALTER COLUMN "thieving" SET NOT NULL,
ALTER COLUMN "thieving" SET DEFAULT 0,
ALTER COLUMN "slayer" SET NOT NULL,
ALTER COLUMN "slayer" SET DEFAULT 0,
ALTER COLUMN "farming" SET NOT NULL,
ALTER COLUMN "farming" SET DEFAULT 0,
ALTER COLUMN "runecrafting" SET NOT NULL,
ALTER COLUMN "runecrafting" SET DEFAULT 0,
ALTER COLUMN "hunter" SET NOT NULL,
ALTER COLUMN "hunter" SET DEFAULT 0,
ALTER COLUMN "construction" SET NOT NULL,
ALTER COLUMN "construction" SET DEFAULT 0,
ALTER COLUMN "abyssal_sire" SET NOT NULL,
ALTER COLUMN "abyssal_sire" SET DEFAULT 0,
ALTER COLUMN "alchemical_hydra" SET NOT NULL,
ALTER COLUMN "alchemical_hydra" SET DEFAULT 0,
ALTER COLUMN "barrows_chests" SET NOT NULL,
ALTER COLUMN "barrows_chests" SET DEFAULT 0,
ALTER COLUMN "bryophyta" SET NOT NULL,
ALTER COLUMN "bryophyta" SET DEFAULT 0,
ALTER COLUMN "callisto" SET NOT NULL,
ALTER COLUMN "callisto" SET DEFAULT 0,
ALTER COLUMN "cerberus" SET NOT NULL,
ALTER COLUMN "cerberus" SET DEFAULT 0,
ALTER COLUMN "chambers_of_xeric" SET NOT NULL,
ALTER COLUMN "chambers_of_xeric" SET DEFAULT 0,
ALTER COLUMN "chambers_of_xeric_challenge_mode" SET NOT NULL,
ALTER COLUMN "chambers_of_xeric_challenge_mode" SET DEFAULT 0,
ALTER COLUMN "chaos_elemental" SET NOT NULL,
ALTER COLUMN "chaos_elemental" SET DEFAULT 0,
ALTER COLUMN "chaos_fanatic" SET NOT NULL,
ALTER COLUMN "chaos_fanatic" SET DEFAULT 0,
ALTER COLUMN "commander_zilyana" SET NOT NULL,
ALTER COLUMN "commander_zilyana" SET DEFAULT 0,
ALTER COLUMN "corporeal_beast" SET NOT NULL,
ALTER COLUMN "corporeal_beast" SET DEFAULT 0,
ALTER COLUMN "crazy_archaeologist" SET NOT NULL,
ALTER COLUMN "crazy_archaeologist" SET DEFAULT 0,
ALTER COLUMN "dagannoth_prime" SET NOT NULL,
ALTER COLUMN "dagannoth_prime" SET DEFAULT 0,
ALTER COLUMN "dagannoth_rex" SET NOT NULL,
ALTER COLUMN "dagannoth_rex" SET DEFAULT 0,
ALTER COLUMN "dagannoth_supreme" SET NOT NULL,
ALTER COLUMN "dagannoth_supreme" SET DEFAULT 0,
ALTER COLUMN "deranged_archaeologist" SET NOT NULL,
ALTER COLUMN "deranged_archaeologist" SET DEFAULT 0,
ALTER COLUMN "general_graardor" SET NOT NULL,
ALTER COLUMN "general_graardor" SET DEFAULT 0,
ALTER COLUMN "giant_mole" SET NOT NULL,
ALTER COLUMN "giant_mole" SET DEFAULT 0,
ALTER COLUMN "grotesque_guardians" SET NOT NULL,
ALTER COLUMN "grotesque_guardians" SET DEFAULT 0,
ALTER COLUMN "hespori" SET NOT NULL,
ALTER COLUMN "hespori" SET DEFAULT 0,
ALTER COLUMN "kalphite_queen" SET NOT NULL,
ALTER COLUMN "kalphite_queen" SET DEFAULT 0,
ALTER COLUMN "king_black_dragon" SET NOT NULL,
ALTER COLUMN "king_black_dragon" SET DEFAULT 0,
ALTER COLUMN "kraken" SET NOT NULL,
ALTER COLUMN "kraken" SET DEFAULT 0,
ALTER COLUMN "kreearra" SET NOT NULL,
ALTER COLUMN "kreearra" SET DEFAULT 0,
ALTER COLUMN "kril_tsutsaroth" SET NOT NULL,
ALTER COLUMN "kril_tsutsaroth" SET DEFAULT 0,
ALTER COLUMN "mimic" SET NOT NULL,
ALTER COLUMN "mimic" SET DEFAULT 0,
ALTER COLUMN "nightmare" SET NOT NULL,
ALTER COLUMN "nightmare" SET DEFAULT 0,
ALTER COLUMN "obor" SET NOT NULL,
ALTER COLUMN "obor" SET DEFAULT 0,
ALTER COLUMN "sarachnis" SET NOT NULL,
ALTER COLUMN "sarachnis" SET DEFAULT 0,
ALTER COLUMN "scorpia" SET NOT NULL,
ALTER COLUMN "scorpia" SET DEFAULT 0,
ALTER COLUMN "skotizo" SET NOT NULL,
ALTER COLUMN "skotizo" SET DEFAULT 0,
ALTER COLUMN "the_gauntlet" SET NOT NULL,
ALTER COLUMN "the_gauntlet" SET DEFAULT 0,
ALTER COLUMN "the_corrupted_gauntlet" SET NOT NULL,
ALTER COLUMN "the_corrupted_gauntlet" SET DEFAULT 0,
ALTER COLUMN "theatre_of_blood" SET NOT NULL,
ALTER COLUMN "theatre_of_blood" SET DEFAULT 0,
ALTER COLUMN "thermonuclear_smoke_devil" SET NOT NULL,
ALTER COLUMN "thermonuclear_smoke_devil" SET DEFAULT 0,
ALTER COLUMN "tzkal_zuk" SET NOT NULL,
ALTER COLUMN "tzkal_zuk" SET DEFAULT 0,
ALTER COLUMN "tztok_jad" SET NOT NULL,
ALTER COLUMN "tztok_jad" SET DEFAULT 0,
ALTER COLUMN "venenatis" SET NOT NULL,
ALTER COLUMN "venenatis" SET DEFAULT 0,
ALTER COLUMN "vetion" SET NOT NULL,
ALTER COLUMN "vetion" SET DEFAULT 0,
ALTER COLUMN "vorkath" SET NOT NULL,
ALTER COLUMN "vorkath" SET DEFAULT 0,
ALTER COLUMN "wintertodt" SET NOT NULL,
ALTER COLUMN "wintertodt" SET DEFAULT 0,
ALTER COLUMN "zalcano" SET NOT NULL,
ALTER COLUMN "zalcano" SET DEFAULT 0,
ALTER COLUMN "zulrah" SET NOT NULL,
ALTER COLUMN "zulrah" SET DEFAULT 0,
ALTER COLUMN "league_points" SET NOT NULL,
ALTER COLUMN "league_points" SET DEFAULT 0,
ALTER COLUMN "bounty_hunter_hunter" SET NOT NULL,
ALTER COLUMN "bounty_hunter_hunter" SET DEFAULT 0,
ALTER COLUMN "bounty_hunter_rogue" SET NOT NULL,
ALTER COLUMN "bounty_hunter_rogue" SET DEFAULT 0,
ALTER COLUMN "clue_scrolls_all" SET NOT NULL,
ALTER COLUMN "clue_scrolls_all" SET DEFAULT 0,
ALTER COLUMN "clue_scrolls_beginner" SET NOT NULL,
ALTER COLUMN "clue_scrolls_beginner" SET DEFAULT 0,
ALTER COLUMN "clue_scrolls_easy" SET NOT NULL,
ALTER COLUMN "clue_scrolls_easy" SET DEFAULT 0,
ALTER COLUMN "clue_scrolls_medium" SET NOT NULL,
ALTER COLUMN "clue_scrolls_medium" SET DEFAULT 0,
ALTER COLUMN "clue_scrolls_hard" SET NOT NULL,
ALTER COLUMN "clue_scrolls_hard" SET DEFAULT 0,
ALTER COLUMN "clue_scrolls_elite" SET NOT NULL,
ALTER COLUMN "clue_scrolls_elite" SET DEFAULT 0,
ALTER COLUMN "clue_scrolls_master" SET NOT NULL,
ALTER COLUMN "clue_scrolls_master" SET DEFAULT 0,
ALTER COLUMN "last_man_standing" SET NOT NULL,
ALTER COLUMN "last_man_standing" SET DEFAULT 0,
ALTER COLUMN "ehp" SET DEFAULT 0,
ALTER COLUMN "ehb" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "deltas_period" ON "deltas"("period");
