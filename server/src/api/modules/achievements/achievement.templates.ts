import { Metrics } from '../../../prisma';
import { Snapshot } from '../../../database/models';
import { AchievementTemplate } from './achievement.types';
import { getMinimumExp } from '../../util/experience';

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  // ------------------
  // CUSTOM ACHIEVEMENTS
  // ------------------
  {
    name: 'Base {level} Stats',
    metric: Metrics.OVERALL,
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
    metric: Metrics.OVERALL,
    thresholds: [100_000_000, 200_000_000, 500_000_000, 1_000_000_000, 2_000_000_000, 4_600_000_000]
  },
  {
    name: '{threshold} Attack',
    metric: Metrics.ATTACK,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Defence',
    metric: Metrics.DEFENCE,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Strength',
    metric: Metrics.STRENGTH,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Hitpoints',
    metric: Metrics.HITPOINTS,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Ranged',
    metric: Metrics.RANGED,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Prayer',
    metric: Metrics.PRAYER,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Magic',
    metric: Metrics.MAGIC,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Cooking',
    metric: Metrics.COOKING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Woodcutting',
    metric: Metrics.WOODCUTTING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Fletching',
    metric: Metrics.FLETCHING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Fishing',
    metric: Metrics.FISHING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Firemaking',
    metric: Metrics.FIREMAKING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Crafting',
    metric: Metrics.CRAFTING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Smithing',
    metric: Metrics.SMITHING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Mining',
    metric: Metrics.MINING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Herblore',
    metric: Metrics.HERBLORE,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Agility',
    metric: Metrics.AGILITY,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Thieving',
    metric: Metrics.THIEVING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Slayer',
    metric: Metrics.SLAYER,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Farming',
    metric: Metrics.FARMING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Runecrafting',
    metric: Metrics.RUNECRAFTING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Hunter',
    metric: Metrics.HUNTER,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Construction',
    metric: Metrics.CONSTRUCTION,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  // -----------------
  // BOSS ACHIEVEMENTS
  // -----------------
  {
    name: '{threshold} Abyssal Sire kills',
    metric: Metrics.ABYSSAL_SIRE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Alchemical Hydra kills',
    metric: Metrics.ALCHEMICAL_HYDRA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Barrows Chests',
    metric: Metrics.BARROWS_CHESTS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Bryophyta kills',
    metric: Metrics.BRYOPHYTA,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Callisto kills',
    metric: Metrics.CALLISTO,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Cerberus kills',
    metric: Metrics.CERBERUS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Chambers Of Xeric kills',
    metric: Metrics.CHAMBERS_OF_XERIC,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Chambers Of Xeric (CM) kills',
    metric: Metrics.CHAMBERS_OF_XERIC_CM,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Chaos Elemental kills',
    metric: Metrics.CHAOS_ELEMENTAL,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Chaos Fanatic kills',
    metric: Metrics.CHAOS_FANATIC,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Commander Zilyana kills',
    metric: Metrics.COMMANDER_ZILYANA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Corporeal Beast kills',
    metric: Metrics.CORPOREAL_BEAST,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Crazy Archaeologist kills',
    metric: Metrics.CRAZY_ARCHAEOLOGIST,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Prime kills',
    metric: Metrics.DAGANNOTH_PRIME,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Rex kills',
    metric: Metrics.DAGANNOTH_REX,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Supreme kills',
    metric: Metrics.DAGANNOTH_SUPREME,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Deranged Archaeologist kills',
    metric: Metrics.DERANGED_ARCHAEOLOGIST,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} General Graardor kills',
    metric: Metrics.GENERAL_GRAARDOR,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Giant Mole kills',
    metric: Metrics.GIANT_MOLE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Grotesque Guardians kills',
    metric: Metrics.GROTESQUE_GUARDIANS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Hespori kills',
    metric: Metrics.HESPORI,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Kalphite Queen kills',
    metric: Metrics.KALPHITE_QUEEN,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} King Black Dragon kills',
    metric: Metrics.KING_BLACK_DRAGON,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Kraken kills',
    metric: Metrics.KRAKEN,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Kree'Arra kills",
    metric: Metrics.KREEARRA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} K'ril Tsutsaroth kills",
    metric: Metrics.KRIL_TSUTSAROTH,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Mimic kills',
    metric: Metrics.MIMIC,
    thresholds: [10, 50, 100, 200]
  },
  {
    name: '{threshold} Nex kills',
    metric: Metrics.NEX,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Nightmare kills',
    metric: Metrics.NIGHTMARE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Phosani's Nightmare kills",
    metric: Metrics.PHOSANIS_NIGHTMARE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Obor kills',
    metric: Metrics.OBOR,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Sarachnis kills',
    metric: Metrics.SARACHNIS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Scorpia kills',
    metric: Metrics.SCORPIA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Skotizo kills',
    metric: Metrics.SKOTIZO,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Tempoross kills',
    metric: Metrics.TEMPOROSS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} The Gauntlet kills',
    metric: Metrics.THE_GAUNTLET,
    thresholds: [100, 200, 1000, 2000]
  },
  {
    name: '{threshold} The Corrupted Gauntlet kills',
    metric: Metrics.THE_CORRUPTED_GAUNTLET,
    thresholds: [100, 200, 1000, 2000]
  },
  {
    name: '{threshold} Theatre Of Blood kills',
    metric: Metrics.THEATRE_OF_BLOOD,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Theatre Of Blood (HM) kills',
    metric: Metrics.THEATRE_OF_BLOOD_HARD_MODE,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Thermonuclear Smoke Devil kills',
    metric: Metrics.THERMONUCLEAR_SMOKE_DEVIL,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} TzKal-Zuk kills',
    metric: Metrics.TZKAL_ZUK,
    thresholds: [10, 50, 100, 200]
  },
  {
    name: '{threshold} TzTok-Jad kills',
    metric: Metrics.TZTOK_JAD,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Venenatis kills',
    metric: Metrics.VENENATIS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Vet'ion kills",
    metric: Metrics.VETION,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Vorkath kills',
    metric: Metrics.VORKATH,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Wintertodt kills',
    metric: Metrics.WINTERTODT,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Zalcano kills',
    metric: Metrics.ZALCANO,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Zulrah kills',
    metric: Metrics.ZULRAH,
    thresholds: [500, 1000, 5000, 10_000]
  },
  // ---------------------
  // ACTIVITY ACHIEVEMENTS
  // ---------------------
  {
    name: '{threshold} Bounty Hunter (Hunter) score',
    metric: Metrics.BOUNTY_HUNTER_HUNTER,
    thresholds: [1000, 5000, 10_000]
  },
  {
    name: '{threshold} Bounty Hunter (Rogue) score',
    metric: Metrics.BOUNTY_HUNTER_ROGUE,
    thresholds: [1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (All)',
    metric: Metrics.CLUE_SCROLLS_ALL,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Beginner)',
    metric: Metrics.CLUE_SCROLLS_BEGINNER,
    thresholds: [200, 500, 1000, 5000]
  },
  {
    name: '{threshold} Clue Scrolls (Easy)',
    metric: Metrics.CLUE_SCROLLS_EASY,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Medium)',
    metric: Metrics.CLUE_SCROLLS_MEDIUM,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Hard)',
    metric: Metrics.CLUE_SCROLLS_HARD,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Elite)',
    metric: Metrics.CLUE_SCROLLS_ELITE,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Clue Scrolls (Master)',
    metric: Metrics.CLUE_SCROLLS_MASTER,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Last Man Standing score',
    metric: Metrics.LAST_MAN_STANDING,
    thresholds: [2000, 5000, 10_000, 15_000]
  },
  {
    name: '{threshold} Soul Wars Zeal',
    metric: Metrics.SOUL_WARS_ZEAL,
    thresholds: [5000, 10_000, 20_000]
  }
];
