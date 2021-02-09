import { Snapshot } from '../../../database/models';
import { CAPPED_MAX_TOTAL_XP, getCappedTotalXp, getCombatLevel } from '../../util/experience';
import { AchievementTemplate } from '../../services/internal/achiev.service';

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  // ------------------
  // SKILL ACHIEVEMENTS
  // ------------------
  {
    name: 'Maxed Overall',
    metric: 'overall',
    measure: 'experience',
    thresholds: [CAPPED_MAX_TOTAL_XP],
    validate: (snapshot: Snapshot) => getCappedTotalXp(snapshot) >= CAPPED_MAX_TOTAL_XP
  },
  {
    name: '126 Combat',
    metric: 'combat',
    measure: 'levels',
    thresholds: [126],
    validate: (snapshot: Snapshot) => getCombatLevel(snapshot) === 126
  },
  {
    name: '{threshold} Overall Exp.',
    metric: 'overall',
    measure: 'experience',
    thresholds: [500_000_000, 1_000_000_000, 2_000_000_000, 4_600_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.overallExperience >= threshold
  },
  {
    name: '{threshold} Attack',
    metric: 'attack',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.attackExperience >= threshold
  },
  {
    name: '{threshold} Defence',
    metric: 'defence',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.defenceExperience >= threshold
  },
  {
    name: '{threshold} Strength',
    metric: 'strength',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.strengthExperience >= threshold
  },
  {
    name: '{threshold} Hitpoints',
    metric: 'hitpoints',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.hitpointsExperience >= threshold
  },
  {
    name: '{threshold} Ranged',
    metric: 'ranged',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.rangedExperience >= threshold
  },
  {
    name: '{threshold} Prayer',
    metric: 'prayer',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.prayerExperience >= threshold
  },
  {
    name: '{threshold} Magic',
    metric: 'magic',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.magicExperience >= threshold
  },
  {
    name: '{threshold} Cooking',
    metric: 'cooking',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.cookingExperience >= threshold
  },
  {
    name: '{threshold} Woodcutting',
    metric: 'woodcutting',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.woodcuttingExperience >= threshold
  },
  {
    name: '{threshold} Fletching',
    metric: 'fletching',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.fletchingExperience >= threshold
  },
  {
    name: '{threshold} Fishing',
    metric: 'fishing',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.fishingExperience >= threshold
  },
  {
    name: '{threshold} Firemaking',
    metric: 'firemaking',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.firemakingExperience >= threshold
  },
  {
    name: '{threshold} Crafting',
    metric: 'crafting',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.craftingExperience >= threshold
  },
  {
    name: '{threshold} Smithing',
    metric: 'smithing',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.smithingExperience >= threshold
  },
  {
    name: '{threshold} Mining',
    metric: 'mining',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.miningExperience >= threshold
  },
  {
    name: '{threshold} Herblore',
    metric: 'herblore',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.herbloreExperience >= threshold
  },
  {
    name: '{threshold} Agility',
    metric: 'agility',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.agilityExperience >= threshold
  },
  {
    name: '{threshold} Thieving',
    metric: 'thieving',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.thievingExperience >= threshold
  },
  {
    name: '{threshold} Slayer',
    metric: 'slayer',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.slayerExperience >= threshold
  },
  {
    name: '{threshold} Farming',
    metric: 'farming',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.farmingExperience >= threshold
  },
  {
    name: '{threshold} Runecrafting',
    metric: 'runecrafting',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.runecraftingExperience >= threshold
  },
  {
    name: '{threshold} Hunter',
    metric: 'hunter',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.hunterExperience >= threshold
  },
  {
    name: '{threshold} Construction',
    metric: 'construction',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.constructionExperience >= threshold
  },
  // -----------------
  // BOSS ACHIEVEMENTS
  // -----------------
  {
    name: '{threshold} Abyssal Sire kills',
    metric: 'abyssal_sire',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.abyssal_sireKills >= threshold
  },
  {
    name: '{threshold} Alchemical Hydra kills',
    metric: 'alchemical_hydra',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.alchemical_hydraKills >= threshold
  },
  {
    name: '{threshold} Barrows Chests',
    metric: 'barrows_chests',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.barrows_chestsKills >= threshold
  },
  {
    name: '{threshold} Bryophyta kills',
    metric: 'bryophyta',
    measure: 'kills',
    thresholds: [50, 100, 500, 1000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.bryophytaKills >= threshold
  },
  {
    name: '{threshold} Callisto kills',
    metric: 'callisto',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.callistoKills >= threshold
  },
  {
    name: '{threshold} Cerberus kills',
    metric: 'cerberus',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.cerberusKills >= threshold
  },
  {
    name: '{threshold} Chambers Of Xeric kills',
    metric: 'chambers_of_xeric',
    measure: 'kills',
    thresholds: [100, 200, 1000, 2000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.chambers_of_xericKills >= threshold
  },
  {
    name: '{threshold} Chambers Of Xeric (CM) kills',
    metric: 'chambers_of_xeric_challenge_mode',
    measure: 'kills',
    thresholds: [100, 200, 1000, 2000],
    validate: (snapshot: Snapshot, threshold: number) =>
      snapshot.chambers_of_xeric_challenge_modeKills >= threshold
  },
  {
    name: '{threshold} Chaos Elemental kills',
    metric: 'chaos_elemental',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.chaos_elementalKills >= threshold
  },
  {
    name: '{threshold} Chaos Fanatic kills',
    metric: 'chaos_fanatic',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.chaos_fanaticKills >= threshold
  },
  {
    name: '{threshold} Commander Zilyana kills',
    metric: 'commander_zilyana',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.commander_zilyanaKills >= threshold
  },
  {
    name: '{threshold} Corporeal Beast kills',
    metric: 'corporeal_beast',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.corporeal_beastKills >= threshold
  },
  {
    name: '{threshold} Crazy Archaeologist kills',
    metric: 'crazy_archaeologist',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.crazy_archaeologistKills >= threshold
  },
  {
    name: '{threshold} Dagannoth Prime kills',
    metric: 'dagannoth_prime',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.dagannoth_primeKills >= threshold
  },
  {
    name: '{threshold} Dagannoth Rex kills',
    metric: 'dagannoth_rex',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.dagannoth_rexKills >= threshold
  },
  {
    name: '{threshold} Dagannoth Supreme kills',
    metric: 'dagannoth_supreme',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.dagannoth_supremeKills >= threshold
  },
  {
    name: '{threshold} Deranged Archaeologist kills',
    metric: 'deranged_archaeologist',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) =>
      snapshot.deranged_archaeologistKills >= threshold
  },
  {
    name: '{threshold} General Graardor kills',
    metric: 'general_graardor',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.general_graardorKills >= threshold
  },
  {
    name: '{threshold} Giant Mole kills',
    metric: 'giant_mole',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.giant_moleKills >= threshold
  },
  {
    name: '{threshold} Grotesque Guardians kills',
    metric: 'grotesque_guardians',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.grotesque_guardiansKills >= threshold
  },
  {
    name: '{threshold} Hespori kills',
    metric: 'hespori',
    measure: 'kills',
    thresholds: [50, 100, 500, 1000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.hesporiKills >= threshold
  },
  {
    name: '{threshold} Kalphite Queen kills',
    metric: 'kalphite_queen',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.kalphite_queenKills >= threshold
  },
  {
    name: '{threshold} King Black Dragon kills',
    metric: 'king_black_dragon',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.king_black_dragonKills >= threshold
  },
  {
    name: '{threshold} Kraken kills',
    metric: 'kraken',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.krakenKills >= threshold
  },
  {
    name: "{threshold} Kree'Arra kills",
    metric: 'kreearra',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.kreearraKills >= threshold
  },
  {
    name: "{threshold} K'ril Tsutsaroth kills",
    metric: 'kril_tsutsaroth',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.kril_tsutsarothKills >= threshold
  },
  {
    name: '{threshold} Mimic kills',
    metric: 'mimic',
    measure: 'kills',
    thresholds: [25, 50, 250, 500],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.mimicKills >= threshold
  },
  {
    name: '{threshold} Nightmare kills',
    metric: 'nightmare',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.nightmareKills >= threshold
  },
  {
    name: '{threshold} Obor kills',
    metric: 'obor',
    measure: 'kills',
    thresholds: [50, 100, 500, 1000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.oborKills >= threshold
  },
  {
    name: '{threshold} Sarachnis kills',
    metric: 'sarachnis',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.sarachnisKills >= threshold
  },
  {
    name: '{threshold} Scorpia kills',
    metric: 'scorpia',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.scorpiaKills >= threshold
  },
  {
    name: '{threshold} Skotizo kills',
    metric: 'skotizo',
    measure: 'kills',
    thresholds: [50, 100, 500, 1000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.skotizoKills >= threshold
  },
  {
    name: '{threshold} The Gauntlet kills',
    metric: 'the_gauntlet',
    measure: 'kills',
    thresholds: [100, 200, 1000, 2000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.the_gauntletKills >= threshold
  },
  {
    name: '{threshold} The Corrupted Gauntlet kills',
    metric: 'the_corrupted_gauntlet',
    measure: 'kills',
    thresholds: [100, 200, 1000, 2000],
    validate: (snapshot: Snapshot, threshold: number) =>
      snapshot.the_corrupted_gauntletKills >= threshold
  },
  {
    name: '{threshold} Theatre Of Blood kills',
    metric: 'theatre_of_blood',
    measure: 'kills',
    thresholds: [100, 200, 1000, 2000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.theatre_of_bloodKills >= threshold
  },
  {
    name: '{threshold} Thermonuclear Smoke Devil kills',
    metric: 'thermonuclear_smoke_devil',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) =>
      snapshot.thermonuclear_smoke_devilKills >= threshold
  },
  {
    name: '{threshold} TzKal-Zuk kills',
    metric: 'tzkal_zuk',
    measure: 'kills',
    thresholds: [25, 50, 250, 500],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.tzkal_zukKills >= threshold
  },
  {
    name: '{threshold} TzTok-Jad kills',
    metric: 'tztok_jad',
    measure: 'kills',
    thresholds: [100, 200, 1000, 2000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.tztok_jadKills >= threshold
  },
  {
    name: '{threshold} Venenatis kills',
    metric: 'venenatis',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.venenatisKills >= threshold
  },
  {
    name: "{threshold} Vet'ion kills",
    metric: 'vetion',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.vetionKills >= threshold
  },
  {
    name: '{threshold} Vorkath kills',
    metric: 'vorkath',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.vorkathKills >= threshold
  },
  {
    name: '{threshold} Wintertodt kills',
    metric: 'wintertodt',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.wintertodtKills >= threshold
  },
  {
    name: '{threshold} Zalcano kills',
    metric: 'zalcano',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.zalcanoKills >= threshold
  },
  {
    name: '{threshold} Zulrah kills',
    metric: 'zulrah',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.zulrahKills >= threshold
  },
  // ---------------------
  // ACTIVITY ACHIEVEMENTS
  // ---------------------
  {
    name: '{threshold} League Points score',
    metric: 'league_points',
    measure: 'score',
    thresholds: [1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.league_pointsScore >= threshold
  },
  {
    name: '{threshold} Bounty Hunter (Hunter) score',
    metric: 'bounty_hunter_hunter',
    measure: 'score',
    thresholds: [1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.bounty_hunter_hunterScore >= threshold
  },
  {
    name: '{threshold} Bounty Hunter (Rogue) score',
    metric: 'bounty_hunter_rogue',
    measure: 'score',
    thresholds: [1000, 5000, 10_000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.bounty_hunter_rogueScore >= threshold
  },
  {
    name: '{threshold} Clue Scrolls (All)',
    metric: 'clue_scrolls_all',
    measure: 'score',
    thresholds: [1000, 5000, 10000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.clue_scrolls_allScore >= threshold
  },
  {
    name: '{threshold} Clue Scrolls (Beginner)',
    metric: 'clue_scrolls_beginner',
    measure: 'score',
    thresholds: [1000, 5000, 10000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.clue_scrolls_beginnerScore >= threshold
  },
  {
    name: '{threshold} Clue Scrolls (Easy)',
    metric: 'clue_scrolls_easy',
    measure: 'score',
    thresholds: [1000, 5000, 10000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.clue_scrolls_easyScore >= threshold
  },
  {
    name: '{threshold} Clue Scrolls (Medium)',
    metric: 'clue_scrolls_medium',
    measure: 'score',
    thresholds: [1000, 5000, 10000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.clue_scrolls_mediumScore >= threshold
  },
  {
    name: '{threshold} Clue Scrolls (Hard)',
    metric: 'clue_scrolls_hard',
    measure: 'score',
    thresholds: [1000, 5000, 10000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.clue_scrolls_hardScore >= threshold
  },
  {
    name: '{threshold} Clue Scrolls (Elite)',
    metric: 'clue_scrolls_elite',
    measure: 'score',
    thresholds: [1000, 5000, 10000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.clue_scrolls_eliteScore >= threshold
  },
  {
    name: '{threshold} Clue Scrolls (Master)',
    metric: 'clue_scrolls_master',
    measure: 'score',
    thresholds: [1000, 5000, 10000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.clue_scrolls_masterScore >= threshold
  },
  {
    name: '{threshold} Last Man Standing score',
    metric: 'last_man_standing',
    measure: 'score',
    thresholds: [1000, 5000, 10000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.last_man_standingScore >= threshold
  },
  {
    name: '{threshold} Soul Wars Zeal',
    metric: 'soul_wars_zeal',
    measure: 'score',
    thresholds: [1000, 5000, 10000],
    validate: (snapshot: Snapshot, threshold: number) => snapshot.soul_wars_zealScore >= threshold
  }
];
