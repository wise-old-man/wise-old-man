import { Snapshot } from '../../../prisma';
import { Metric } from '../../../utils';
import { getMinimumExp } from '../snapshots/snapshot.utils';
import { AchievementTemplate } from './achievement.types';

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  // ------------------
  // CUSTOM ACHIEVEMENTS
  // ------------------
  {
    name: 'Base {level} Stats',
    metric: Metric.OVERALL,
    measure: 'levels',
    thresholds: [273_742, 737_627, 1_986_068, 5_346_332, 13_034_431],
    getCurrentValue: (snapshot: Snapshot) => {
      return getMinimumExp(snapshot);
    }
  },
  // ------------------
  // SKILL ACHIEVEMENTS
  // ------------------
  {
    name: '{threshold} Overall Exp.',
    metric: Metric.OVERALL,
    thresholds: [100_000_000, 200_000_000, 500_000_000, 1_000_000_000, 2_000_000_000, 4_600_000_000]
  },
  {
    name: '{threshold} Attack',
    metric: Metric.ATTACK,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Defence',
    metric: Metric.DEFENCE,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Strength',
    metric: Metric.STRENGTH,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Hitpoints',
    metric: Metric.HITPOINTS,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Ranged',
    metric: Metric.RANGED,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Prayer',
    metric: Metric.PRAYER,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Magic',
    metric: Metric.MAGIC,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Cooking',
    metric: Metric.COOKING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Woodcutting',
    metric: Metric.WOODCUTTING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Fletching',
    metric: Metric.FLETCHING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Fishing',
    metric: Metric.FISHING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Firemaking',
    metric: Metric.FIREMAKING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Crafting',
    metric: Metric.CRAFTING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Smithing',
    metric: Metric.SMITHING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Mining',
    metric: Metric.MINING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Herblore',
    metric: Metric.HERBLORE,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Agility',
    metric: Metric.AGILITY,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Thieving',
    metric: Metric.THIEVING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Slayer',
    metric: Metric.SLAYER,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Farming',
    metric: Metric.FARMING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Runecrafting',
    metric: Metric.RUNECRAFTING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Hunter',
    metric: Metric.HUNTER,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Construction',
    metric: Metric.CONSTRUCTION,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  // -----------------
  // BOSS ACHIEVEMENTS
  // -----------------
  {
    name: '{threshold} Abyssal Sire kills',
    metric: Metric.ABYSSAL_SIRE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Alchemical Hydra kills',
    metric: Metric.ALCHEMICAL_HYDRA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Barrows Chests',
    metric: Metric.BARROWS_CHESTS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Bryophyta kills',
    metric: Metric.BRYOPHYTA,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Callisto kills',
    metric: Metric.CALLISTO,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Cerberus kills',
    metric: Metric.CERBERUS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Chambers Of Xeric kills',
    metric: Metric.CHAMBERS_OF_XERIC,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Chambers Of Xeric (CM) kills',
    metric: Metric.CHAMBERS_OF_XERIC_CM,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Chaos Elemental kills',
    metric: Metric.CHAOS_ELEMENTAL,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Chaos Fanatic kills',
    metric: Metric.CHAOS_FANATIC,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Commander Zilyana kills',
    metric: Metric.COMMANDER_ZILYANA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Corporeal Beast kills',
    metric: Metric.CORPOREAL_BEAST,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Crazy Archaeologist kills',
    metric: Metric.CRAZY_ARCHAEOLOGIST,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Prime kills',
    metric: Metric.DAGANNOTH_PRIME,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Rex kills',
    metric: Metric.DAGANNOTH_REX,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Supreme kills',
    metric: Metric.DAGANNOTH_SUPREME,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Deranged Archaeologist kills',
    metric: Metric.DERANGED_ARCHAEOLOGIST,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} General Graardor kills',
    metric: Metric.GENERAL_GRAARDOR,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Giant Mole kills',
    metric: Metric.GIANT_MOLE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Grotesque Guardians kills',
    metric: Metric.GROTESQUE_GUARDIANS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Hespori kills',
    metric: Metric.HESPORI,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Kalphite Queen kills',
    metric: Metric.KALPHITE_QUEEN,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} King Black Dragon kills',
    metric: Metric.KING_BLACK_DRAGON,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Kraken kills',
    metric: Metric.KRAKEN,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Kree'Arra kills",
    metric: Metric.KREEARRA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} K'ril Tsutsaroth kills",
    metric: Metric.KRIL_TSUTSAROTH,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Mimic kills',
    metric: Metric.MIMIC,
    thresholds: [10, 50, 100, 200]
  },
  {
    name: '{threshold} Nex kills',
    metric: Metric.NEX,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Nightmare kills',
    metric: Metric.NIGHTMARE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Phosani's Nightmare kills",
    metric: Metric.PHOSANIS_NIGHTMARE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Obor kills',
    metric: Metric.OBOR,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Sarachnis kills',
    metric: Metric.SARACHNIS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Scorpia kills',
    metric: Metric.SCORPIA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Skotizo kills',
    metric: Metric.SKOTIZO,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Tempoross kills',
    metric: Metric.TEMPOROSS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} The Gauntlet kills',
    metric: Metric.THE_GAUNTLET,
    thresholds: [100, 200, 1000, 2000]
  },
  {
    name: '{threshold} The Corrupted Gauntlet kills',
    metric: Metric.THE_CORRUPTED_GAUNTLET,
    thresholds: [100, 200, 1000, 2000]
  },
  {
    name: '{threshold} Theatre Of Blood kills',
    metric: Metric.THEATRE_OF_BLOOD,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Theatre Of Blood (HM) kills',
    metric: Metric.THEATRE_OF_BLOOD_HARD_MODE,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Thermonuclear Smoke Devil kills',
    metric: Metric.THERMONUCLEAR_SMOKE_DEVIL,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Tombs of Amascut kills',
    metric: Metric.TOMBS_OF_AMASCUT,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Tombs of Amascut (Expert Mode) kills',
    metric: Metric.TOMBS_OF_AMASCUT_EXPERT,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} TzKal-Zuk kills',
    metric: Metric.TZKAL_ZUK,
    thresholds: [10, 50, 100, 200]
  },
  {
    name: '{threshold} TzTok-Jad kills',
    metric: Metric.TZTOK_JAD,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Venenatis kills',
    metric: Metric.VENENATIS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Vet'ion kills",
    metric: Metric.VETION,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Vorkath kills',
    metric: Metric.VORKATH,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Wintertodt kills',
    metric: Metric.WINTERTODT,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Zalcano kills',
    metric: Metric.ZALCANO,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Zulrah kills',
    metric: Metric.ZULRAH,
    thresholds: [500, 1000, 5000, 10_000]
  },
  // ---------------------
  // ACTIVITY ACHIEVEMENTS
  // ---------------------
  {
    name: '{threshold} Bounty Hunter (Hunter) score',
    metric: Metric.BOUNTY_HUNTER_HUNTER,
    thresholds: [1000, 5000, 10_000]
  },
  {
    name: '{threshold} Bounty Hunter (Rogue) score',
    metric: Metric.BOUNTY_HUNTER_ROGUE,
    thresholds: [1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (All)',
    metric: Metric.CLUE_SCROLLS_ALL,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Beginner)',
    metric: Metric.CLUE_SCROLLS_BEGINNER,
    thresholds: [200, 500, 1000, 5000]
  },
  {
    name: '{threshold} Clue Scrolls (Easy)',
    metric: Metric.CLUE_SCROLLS_EASY,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Medium)',
    metric: Metric.CLUE_SCROLLS_MEDIUM,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Hard)',
    metric: Metric.CLUE_SCROLLS_HARD,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Elite)',
    metric: Metric.CLUE_SCROLLS_ELITE,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Clue Scrolls (Master)',
    metric: Metric.CLUE_SCROLLS_MASTER,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Last Man Standing score',
    metric: Metric.LAST_MAN_STANDING,
    thresholds: [2000, 5000, 10_000, 15_000]
  },
  {
    name: '{threshold} Soul Wars Zeal',
    metric: Metric.SOUL_WARS_ZEAL,
    thresholds: [5000, 10_000, 20_000]
  }
];
