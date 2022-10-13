-- CreateEnum
CREATE TYPE "enum_competitions_metric" AS ENUM ('overall', 'attack', 'defence', 'strength', 'hitpoints', 'ranged', 'prayer', 'magic', 'cooking', 'woodcutting', 'fletching', 'fishing', 'firemaking', 'crafting', 'smithing', 'mining', 'herblore', 'agility', 'thieving', 'slayer', 'farming', 'runecrafting', 'hunter', 'construction', 'league_points', 'bounty_hunter_hunter', 'bounty_hunter_rogue', 'clue_scrolls_all', 'clue_scrolls_beginner', 'clue_scrolls_easy', 'clue_scrolls_medium', 'clue_scrolls_hard', 'clue_scrolls_elite', 'clue_scrolls_master', 'last_man_standing', 'abyssal_sire', 'alchemical_hydra', 'barrows_chests', 'bryophyta', 'callisto', 'cerberus', 'chambers_of_xeric', 'chambers_of_xeric_challenge_mode', 'chaos_elemental', 'chaos_fanatic', 'commander_zilyana', 'corporeal_beast', 'crazy_archaeologist', 'dagannoth_prime', 'dagannoth_rex', 'dagannoth_supreme', 'deranged_archaeologist', 'general_graardor', 'giant_mole', 'grotesque_guardians', 'hespori', 'kalphite_queen', 'king_black_dragon', 'kraken', 'kreearra', 'kril_tsutsaroth', 'mimic', 'nightmare', 'obor', 'sarachnis', 'scorpia', 'skotizo', 'the_gauntlet', 'the_corrupted_gauntlet', 'theatre_of_blood', 'thermonuclear_smoke_devil', 'tzkal_zuk', 'tztok_jad', 'venenatis', 'vetion', 'vorkath', 'wintertodt', 'zalcano', 'zulrah', 'ehp', 'ehb', 'soul_wars_zeal');

-- CreateEnum
CREATE TYPE "enum_deltas_period" AS ENUM ('day', 'week', 'month', 'year');

-- CreateEnum
CREATE TYPE "enum_memberships_role" AS ENUM ('member', 'leader');

-- CreateEnum
CREATE TYPE "enum_players_type" AS ENUM ('unknown', 'regular', 'ironman', 'hardcore', 'ultimate');

-- CreateEnum
CREATE TYPE "enum_records_metric" AS ENUM ('overall', 'attack', 'defence', 'strength', 'hitpoints', 'ranged', 'prayer', 'magic', 'cooking', 'woodcutting', 'fletching', 'fishing', 'firemaking', 'crafting', 'smithing', 'mining', 'herblore', 'agility', 'thieving', 'slayer', 'farming', 'runecrafting', 'hunter', 'construction', 'league_points', 'bounter_hunter_hunter', 'bounter_hunter_rogue', 'clue_scrolls_all', 'clue_scrolls_beginner', 'clue_scroll_easy', 'clue_scroll_medium', 'clue_scroll_hard', 'clue_scroll_elite', 'clue_scroll_master', 'last_man_standing', 'abyssal_sire', 'alchemical_hydra', 'barrows_chests', 'bryophyta', 'callisto', 'cerberus', 'chambers_of_xeric', 'chambers_of_xeric_challenge_mode', 'chaos_elemental', 'chaos_fanatic', 'commander_zilyana', 'corporeal_beast', 'crazy_archaeologist', 'dagannoth_prime', 'dagannoth_rex', 'dagannoth_supreme', 'deranged_archaeologist', 'general_graardor', 'giant_mole', 'grotesque_guardians', 'hespori', 'kalphite_queen', 'king_black_dragon', 'kraken', 'kreearra', 'kril_tsutsaroth', 'mimic', 'nightmare', 'obor', 'sarachnis', 'scorpia', 'skotizo', 'the_gauntlet', 'the_corrupted_gauntlet', 'theatre_of_blood', 'thermonuclear_smoke_devil', 'tzkal_zuk', 'tztok_jad', 'venenatis', 'vetion', 'vorkath', 'wintertodt', 'zalcano', 'zulrah', 'bounty_hunter_hunter', 'bounty_hunter_rogue', 'clue_scrolls_easy', 'clue_scrolls_medium', 'clue_scrolls_hard', 'clue_scrolls_elite', 'clue_scrolls_master', 'ehp', 'ehb', 'soul_wars_zeal', 'tempoross', 'theatre_of_blood_hard_mode', 'phosanis_nightmare');

-- CreateEnum
CREATE TYPE "enum_records_period" AS ENUM ('day', 'week', 'month', 'year', '6h', '5min');

-- CreateTable
CREATE TABLE "achievements" (
    "playerId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "metric" VARCHAR(255),
    "threshold" BIGINT,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("playerId","name")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "metric" VARCHAR(100) NOT NULL,
    "verificationHash" VARCHAR(255) NOT NULL,
    "startsAt" TIMESTAMPTZ(6) NOT NULL,
    "endsAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "groupId" INTEGER,
    "score" INTEGER DEFAULT 0,
    "type" VARCHAR(20) DEFAULT E'classic',

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deltas" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "period" VARCHAR(20) NOT NULL,
    "startedAt" TIMESTAMPTZ(6) NOT NULL,
    "endedAt" TIMESTAMPTZ(6) NOT NULL,
    "overall" BIGINT,
    "attack" INTEGER,
    "defence" INTEGER,
    "strength" INTEGER,
    "hitpoints" INTEGER,
    "ranged" INTEGER,
    "prayer" INTEGER,
    "magic" INTEGER,
    "cooking" INTEGER,
    "woodcutting" INTEGER,
    "fletching" INTEGER,
    "fishing" INTEGER,
    "firemaking" INTEGER,
    "crafting" INTEGER,
    "smithing" INTEGER,
    "mining" INTEGER,
    "herblore" INTEGER,
    "agility" INTEGER,
    "thieving" INTEGER,
    "slayer" INTEGER,
    "farming" INTEGER,
    "runecrafting" INTEGER,
    "hunter" INTEGER,
    "construction" INTEGER,
    "abyssal_sire" INTEGER,
    "alchemical_hydra" INTEGER,
    "barrows_chests" INTEGER,
    "bryophyta" INTEGER,
    "callisto" INTEGER,
    "cerberus" INTEGER,
    "chambers_of_xeric" INTEGER,
    "chambers_of_xeric_challenge_mode" INTEGER,
    "chaos_elemental" INTEGER,
    "chaos_fanatic" INTEGER,
    "commander_zilyana" INTEGER,
    "corporeal_beast" INTEGER,
    "crazy_archaeologist" INTEGER,
    "dagannoth_prime" INTEGER,
    "dagannoth_rex" INTEGER,
    "dagannoth_supreme" INTEGER,
    "deranged_archaeologist" INTEGER,
    "general_graardor" INTEGER,
    "giant_mole" INTEGER,
    "grotesque_guardians" INTEGER,
    "hespori" INTEGER,
    "kalphite_queen" INTEGER,
    "king_black_dragon" INTEGER,
    "kraken" INTEGER,
    "kreearra" INTEGER,
    "kril_tsutsaroth" INTEGER,
    "mimic" INTEGER,
    "nightmare" INTEGER,
    "obor" INTEGER,
    "sarachnis" INTEGER,
    "scorpia" INTEGER,
    "skotizo" INTEGER,
    "the_gauntlet" INTEGER,
    "the_corrupted_gauntlet" INTEGER,
    "theatre_of_blood" INTEGER,
    "thermonuclear_smoke_devil" INTEGER,
    "tzkal_zuk" INTEGER,
    "tztok_jad" INTEGER,
    "venenatis" INTEGER,
    "vetion" INTEGER,
    "vorkath" INTEGER,
    "wintertodt" INTEGER,
    "zalcano" INTEGER,
    "zulrah" INTEGER,
    "league_points" INTEGER,
    "bounty_hunter_hunter" INTEGER,
    "bounty_hunter_rogue" INTEGER,
    "clue_scrolls_all" INTEGER,
    "clue_scrolls_beginner" INTEGER,
    "clue_scrolls_easy" INTEGER,
    "clue_scrolls_medium" INTEGER,
    "clue_scrolls_hard" INTEGER,
    "clue_scrolls_elite" INTEGER,
    "clue_scrolls_master" INTEGER,
    "last_man_standing" INTEGER,
    "updatedAt" TIMESTAMP(3),
    "ehp" DOUBLE PRECISION NOT NULL DEFAULT -1,
    "ehb" DOUBLE PRECISION NOT NULL DEFAULT -1,
    "soul_wars_zeal" INTEGER NOT NULL DEFAULT 0,
    "tempoross" INTEGER NOT NULL DEFAULT 0,
    "theatre_of_blood_hard_mode" INTEGER NOT NULL DEFAULT 0,
    "phosanis_nightmare" INTEGER NOT NULL DEFAULT 0,
    "nex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "deltas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "verificationHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "clanChat" VARCHAR(20),
    "score" INTEGER DEFAULT 0,
    "verified" BOOLEAN DEFAULT false,
    "homeworld" INTEGER,
    "description" VARCHAR(100),

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "playerId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "role" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("playerId","groupId")
);

-- CreateTable
CREATE TABLE "nameChanges" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "oldName" VARCHAR(20) NOT NULL,
    "newName" VARCHAR(20) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "resolvedAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nameChanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participations" (
    "playerId" INTEGER NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "startSnapshotId" INTEGER,
    "endSnapshotId" INTEGER,
    "teamName" VARCHAR(30),

    CONSTRAINT "participations_pkey" PRIMARY KEY ("playerId","competitionId")
);

-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "type" "enum_players_type" DEFAULT E'unknown',
    "lastImportedAt" TIMESTAMPTZ(6),
    "registeredAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "displayName" VARCHAR(20),
    "flagged" BOOLEAN DEFAULT false,
    "build" VARCHAR(255) NOT NULL DEFAULT E'main',
    "exp" BIGINT NOT NULL DEFAULT 0,
    "ehp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ehb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ttm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tt200m" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastChangedAt" TIMESTAMPTZ(6),
    "country" VARCHAR(3),

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "period" "enum_records_period" NOT NULL,
    "metric" "enum_records_metric" NOT NULL,
    "value" BIGINT DEFAULT 0,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "importedAt" TIMESTAMPTZ(6),
    "overallRank" INTEGER,
    "overallExperience" BIGINT,
    "attackRank" INTEGER,
    "attackExperience" INTEGER,
    "defenceRank" INTEGER,
    "defenceExperience" INTEGER,
    "strengthRank" INTEGER,
    "strengthExperience" INTEGER,
    "hitpointsRank" INTEGER,
    "hitpointsExperience" INTEGER,
    "rangedRank" INTEGER,
    "rangedExperience" INTEGER,
    "prayerRank" INTEGER,
    "prayerExperience" INTEGER,
    "magicRank" INTEGER,
    "magicExperience" INTEGER,
    "cookingRank" INTEGER,
    "cookingExperience" INTEGER,
    "woodcuttingRank" INTEGER,
    "woodcuttingExperience" INTEGER,
    "fletchingRank" INTEGER,
    "fletchingExperience" INTEGER,
    "fishingRank" INTEGER,
    "fishingExperience" INTEGER,
    "firemakingRank" INTEGER,
    "firemakingExperience" INTEGER,
    "craftingRank" INTEGER,
    "craftingExperience" INTEGER,
    "smithingRank" INTEGER,
    "smithingExperience" INTEGER,
    "miningRank" INTEGER,
    "miningExperience" INTEGER,
    "herbloreRank" INTEGER,
    "herbloreExperience" INTEGER,
    "agilityRank" INTEGER,
    "agilityExperience" INTEGER,
    "thievingRank" INTEGER,
    "thievingExperience" INTEGER,
    "slayerRank" INTEGER,
    "slayerExperience" INTEGER,
    "farmingRank" INTEGER,
    "farmingExperience" INTEGER,
    "runecraftingRank" INTEGER,
    "runecraftingExperience" INTEGER,
    "hunterRank" INTEGER,
    "hunterExperience" INTEGER,
    "constructionRank" INTEGER,
    "constructionExperience" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "league_pointsRank" INTEGER NOT NULL DEFAULT -1,
    "league_pointsScore" INTEGER NOT NULL DEFAULT -1,
    "bounty_hunter_hunterRank" INTEGER NOT NULL DEFAULT -1,
    "bounty_hunter_hunterScore" INTEGER NOT NULL DEFAULT -1,
    "bounty_hunter_rogueScore" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_allRank" INTEGER NOT NULL DEFAULT -1,
    "bounty_hunter_rogueRank" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_allScore" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_beginnerRank" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_easyRank" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_beginnerScore" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_easyScore" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_mediumRank" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_mediumScore" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_hardRank" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_hardScore" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_eliteRank" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_eliteScore" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_masterRank" INTEGER NOT NULL DEFAULT -1,
    "last_man_standingRank" INTEGER NOT NULL DEFAULT -1,
    "clue_scrolls_masterScore" INTEGER NOT NULL DEFAULT -1,
    "last_man_standingScore" INTEGER NOT NULL DEFAULT -1,
    "abyssal_sireRank" INTEGER NOT NULL DEFAULT -1,
    "abyssal_sireKills" INTEGER NOT NULL DEFAULT -1,
    "alchemical_hydraRank" INTEGER NOT NULL DEFAULT -1,
    "alchemical_hydraKills" INTEGER NOT NULL DEFAULT -1,
    "barrows_chestsRank" INTEGER NOT NULL DEFAULT -1,
    "barrows_chestsKills" INTEGER NOT NULL DEFAULT -1,
    "bryophytaKills" INTEGER NOT NULL DEFAULT -1,
    "bryophytaRank" INTEGER NOT NULL DEFAULT -1,
    "cerberusKills" INTEGER NOT NULL DEFAULT -1,
    "chambers_of_xericRank" INTEGER NOT NULL DEFAULT -1,
    "cerberusRank" INTEGER NOT NULL DEFAULT -1,
    "callistoRank" INTEGER NOT NULL DEFAULT -1,
    "callistoKills" INTEGER NOT NULL DEFAULT -1,
    "chambers_of_xericKills" INTEGER NOT NULL DEFAULT -1,
    "chambers_of_xeric_challenge_modeRank" INTEGER NOT NULL DEFAULT -1,
    "chambers_of_xeric_challenge_modeKills" INTEGER NOT NULL DEFAULT -1,
    "chaos_elementalKills" INTEGER NOT NULL DEFAULT -1,
    "chaos_fanaticKills" INTEGER NOT NULL DEFAULT -1,
    "chaos_fanaticRank" INTEGER NOT NULL DEFAULT -1,
    "commander_zilyanaRank" INTEGER NOT NULL DEFAULT -1,
    "chaos_elementalRank" INTEGER NOT NULL DEFAULT -1,
    "commander_zilyanaKills" INTEGER NOT NULL DEFAULT -1,
    "corporeal_beastRank" INTEGER NOT NULL DEFAULT -1,
    "corporeal_beastKills" INTEGER NOT NULL DEFAULT -1,
    "crazy_archaeologistRank" INTEGER NOT NULL DEFAULT -1,
    "crazy_archaeologistKills" INTEGER NOT NULL DEFAULT -1,
    "dagannoth_primeRank" INTEGER NOT NULL DEFAULT -1,
    "dagannoth_primeKills" INTEGER NOT NULL DEFAULT -1,
    "dagannoth_rexRank" INTEGER NOT NULL DEFAULT -1,
    "dagannoth_rexKills" INTEGER NOT NULL DEFAULT -1,
    "dagannoth_supremeRank" INTEGER NOT NULL DEFAULT -1,
    "dagannoth_supremeKills" INTEGER NOT NULL DEFAULT -1,
    "deranged_archaeologistRank" INTEGER NOT NULL DEFAULT -1,
    "deranged_archaeologistKills" INTEGER NOT NULL DEFAULT -1,
    "general_graardorRank" INTEGER NOT NULL DEFAULT -1,
    "general_graardorKills" INTEGER NOT NULL DEFAULT -1,
    "giant_moleRank" INTEGER NOT NULL DEFAULT -1,
    "giant_moleKills" INTEGER NOT NULL DEFAULT -1,
    "grotesque_guardiansRank" INTEGER NOT NULL DEFAULT -1,
    "grotesque_guardiansKills" INTEGER NOT NULL DEFAULT -1,
    "hesporiRank" INTEGER NOT NULL DEFAULT -1,
    "kalphite_queenKills" INTEGER NOT NULL DEFAULT -1,
    "hesporiKills" INTEGER NOT NULL DEFAULT -1,
    "kalphite_queenRank" INTEGER NOT NULL DEFAULT -1,
    "king_black_dragonRank" INTEGER NOT NULL DEFAULT -1,
    "king_black_dragonKills" INTEGER NOT NULL DEFAULT -1,
    "krakenRank" INTEGER NOT NULL DEFAULT -1,
    "krakenKills" INTEGER NOT NULL DEFAULT -1,
    "kreearraRank" INTEGER NOT NULL DEFAULT -1,
    "kreearraKills" INTEGER NOT NULL DEFAULT -1,
    "kril_tsutsarothRank" INTEGER NOT NULL DEFAULT -1,
    "kril_tsutsarothKills" INTEGER NOT NULL DEFAULT -1,
    "mimicRank" INTEGER NOT NULL DEFAULT -1,
    "mimicKills" INTEGER NOT NULL DEFAULT -1,
    "nightmareRank" INTEGER NOT NULL DEFAULT -1,
    "nightmareKills" INTEGER NOT NULL DEFAULT -1,
    "oborRank" INTEGER NOT NULL DEFAULT -1,
    "oborKills" INTEGER NOT NULL DEFAULT -1,
    "sarachnisRank" INTEGER NOT NULL DEFAULT -1,
    "sarachnisKills" INTEGER NOT NULL DEFAULT -1,
    "scorpiaRank" INTEGER NOT NULL DEFAULT -1,
    "scorpiaKills" INTEGER NOT NULL DEFAULT -1,
    "skotizoRank" INTEGER NOT NULL DEFAULT -1,
    "skotizoKills" INTEGER NOT NULL DEFAULT -1,
    "the_gauntletRank" INTEGER NOT NULL DEFAULT -1,
    "the_gauntletKills" INTEGER NOT NULL DEFAULT -1,
    "the_corrupted_gauntletKills" INTEGER NOT NULL DEFAULT -1,
    "the_corrupted_gauntletRank" INTEGER NOT NULL DEFAULT -1,
    "theatre_of_bloodRank" INTEGER NOT NULL DEFAULT -1,
    "theatre_of_bloodKills" INTEGER NOT NULL DEFAULT -1,
    "thermonuclear_smoke_devilRank" INTEGER NOT NULL DEFAULT -1,
    "thermonuclear_smoke_devilKills" INTEGER NOT NULL DEFAULT -1,
    "tzkal_zukRank" INTEGER NOT NULL DEFAULT -1,
    "tzkal_zukKills" INTEGER NOT NULL DEFAULT -1,
    "tztok_jadRank" INTEGER NOT NULL DEFAULT -1,
    "tztok_jadKills" INTEGER NOT NULL DEFAULT -1,
    "venenatisRank" INTEGER NOT NULL DEFAULT -1,
    "venenatisKills" INTEGER NOT NULL DEFAULT -1,
    "vetionRank" INTEGER NOT NULL DEFAULT -1,
    "vetionKills" INTEGER NOT NULL DEFAULT -1,
    "vorkathRank" INTEGER NOT NULL DEFAULT -1,
    "vorkathKills" INTEGER NOT NULL DEFAULT -1,
    "wintertodtRank" INTEGER NOT NULL DEFAULT -1,
    "zalcanoRank" INTEGER NOT NULL DEFAULT -1,
    "wintertodtKills" INTEGER NOT NULL DEFAULT -1,
    "zalcanoKills" INTEGER NOT NULL DEFAULT -1,
    "zulrahRank" INTEGER NOT NULL DEFAULT -1,
    "zulrahKills" INTEGER NOT NULL DEFAULT -1,
    "ehpValue" DOUBLE PRECISION NOT NULL DEFAULT -1,
    "ehbValue" DOUBLE PRECISION NOT NULL DEFAULT -1,
    "ehbRank" INTEGER NOT NULL DEFAULT -1,
    "ehpRank" INTEGER NOT NULL DEFAULT -1,
    "soul_wars_zealScore" INTEGER NOT NULL DEFAULT -1,
    "soul_wars_zealRank" INTEGER NOT NULL DEFAULT -1,
    "temporossKills" INTEGER NOT NULL DEFAULT -1,
    "temporossRank" INTEGER NOT NULL DEFAULT -1,
    "theatre_of_blood_hard_modeKills" INTEGER NOT NULL DEFAULT -1,
    "theatre_of_blood_hard_modeRank" INTEGER NOT NULL DEFAULT -1,
    "phosanis_nightmareKills" INTEGER NOT NULL DEFAULT -1,
    "phosanis_nightmareRank" INTEGER NOT NULL DEFAULT -1,
    "nexKills" INTEGER NOT NULL DEFAULT -1,
    "nexRank" INTEGER NOT NULL DEFAULT -1,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "achievements_player_id" ON "achievements"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_player_id_type" ON "achievements"("playerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "competitions_id" ON "competitions"("id");

-- CreateIndex
CREATE INDEX "competitions_ends_at" ON "competitions"("endsAt");

-- CreateIndex
CREATE INDEX "competitions_metric" ON "competitions"("metric");

-- CreateIndex
CREATE INDEX "competitions_starts_at" ON "competitions"("startsAt");

-- CreateIndex
CREATE INDEX "competitions_title" ON "competitions"("title");

-- CreateIndex
CREATE UNIQUE INDEX "deltas_id" ON "deltas"("id");

-- CreateIndex
CREATE INDEX "deltas_period" ON "deltas"("period");

-- CreateIndex
CREATE INDEX "deltas_playerId" ON "deltas"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "groups_id" ON "groups"("id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_name" ON "groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_player_id_group_id" ON "memberships"("playerId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "name_changes_id" ON "nameChanges"("id");

-- CreateIndex
CREATE INDEX "name_changes_player_id" ON "nameChanges"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "participations_player_id_competition_id" ON "participations"("playerId", "competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "players_id" ON "players"("id");

-- CreateIndex
CREATE UNIQUE INDEX "players_username" ON "players"("username");

-- CreateIndex
CREATE INDEX "players_type" ON "players"("type");

-- CreateIndex
CREATE UNIQUE INDEX "records_id" ON "records"("id");

-- CreateIndex
CREATE INDEX "records_metric" ON "records"("metric");

-- CreateIndex
CREATE INDEX "records_period" ON "records"("period");

-- CreateIndex
CREATE INDEX "records_player_id" ON "records"("playerId");

-- CreateIndex
CREATE INDEX "records_player_id_period" ON "records"("playerId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "records_player_id_period_metric" ON "records"("playerId", "period", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "snapshots_id" ON "snapshots"("id");

-- CreateIndex
CREATE INDEX "snapshots_created_at" ON "snapshots"("createdAt");

-- CreateIndex
CREATE INDEX "snapshots_player_id" ON "snapshots"("playerId");

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "deltas" ADD CONSTRAINT "deltas_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nameChanges" ADD CONSTRAINT "nameChanges_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_endSnapshotId_fkey" FOREIGN KEY ("endSnapshotId") REFERENCES "snapshots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_startSnapshotId_fkey" FOREIGN KEY ("startSnapshotId") REFERENCES "snapshots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
