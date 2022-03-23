import { MetricEnum } from '../../../prisma';
import { Snapshot } from '../../../database/models';
import { AchievementTemplate } from './achievement.types';
import { getMinimumExp } from '../../util/experience';

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  // ------------------
  // CUSTOM ACHIEVEMENTS
  // ------------------
  {
    name: 'Base {level} Stats',
    metric: MetricEnum.OVERALL,
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
    metric: MetricEnum.OVERALL,
    thresholds: [100_000_000, 200_000_000, 500_000_000, 1_000_000_000, 2_000_000_000, 4_600_000_000]
  },
  {
    name: '{threshold} Attack',
    metric: MetricEnum.ATTACK,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Defence',
    metric: MetricEnum.DEFENCE,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Strength',
    metric: MetricEnum.STRENGTH,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Hitpoints',
    metric: MetricEnum.HITPOINTS,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Ranged',
    metric: MetricEnum.RANGED,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Prayer',
    metric: MetricEnum.PRAYER,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Magic',
    metric: MetricEnum.MAGIC,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Cooking',
    metric: MetricEnum.COOKING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Woodcutting',
    metric: MetricEnum.WOODCUTTING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Fletching',
    metric: MetricEnum.FLETCHING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Fishing',
    metric: MetricEnum.FISHING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Firemaking',
    metric: MetricEnum.FIREMAKING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Crafting',
    metric: MetricEnum.CRAFTING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Smithing',
    metric: MetricEnum.SMITHING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Mining',
    metric: MetricEnum.MINING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Herblore',
    metric: MetricEnum.HERBLORE,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Agility',
    metric: MetricEnum.AGILITY,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Thieving',
    metric: MetricEnum.THIEVING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Slayer',
    metric: MetricEnum.SLAYER,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Farming',
    metric: MetricEnum.FARMING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Runecrafting',
    metric: MetricEnum.RUNECRAFTING,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Hunter',
    metric: MetricEnum.HUNTER,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Construction',
    metric: MetricEnum.CONSTRUCTION,
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  // -----------------
  // BOSS ACHIEVEMENTS
  // -----------------
  {
    name: '{threshold} Abyssal Sire kills',
    metric: MetricEnum.ABYSSAL_SIRE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Alchemical Hydra kills',
    metric: MetricEnum.ALCHEMICAL_HYDRA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Barrows Chests',
    metric: MetricEnum.BARROWS_CHESTS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Bryophyta kills',
    metric: MetricEnum.BRYOPHYTA,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Callisto kills',
    metric: MetricEnum.CALLISTO,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Cerberus kills',
    metric: MetricEnum.CERBERUS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Chambers Of Xeric kills',
    metric: MetricEnum.CHAMBERS_OF_XERIC,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Chambers Of Xeric (CM) kills',
    metric: MetricEnum.CHAMBERS_OF_XERIC_CM,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Chaos Elemental kills',
    metric: MetricEnum.CHAOS_ELEMENTAL,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Chaos Fanatic kills',
    metric: MetricEnum.CHAOS_FANATIC,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Commander Zilyana kills',
    metric: MetricEnum.COMMANDER_ZILYANA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Corporeal Beast kills',
    metric: MetricEnum.CORPOREAL_BEAST,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Crazy Archaeologist kills',
    metric: MetricEnum.CRAZY_ARCHAEOLOGIST,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Prime kills',
    metric: MetricEnum.DAGANNOTH_PRIME,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Rex kills',
    metric: MetricEnum.DAGANNOTH_REX,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Supreme kills',
    metric: MetricEnum.DAGANNOTH_SUPREME,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Deranged Archaeologist kills',
    metric: MetricEnum.DERANGED_ARCHAEOLOGIST,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} General Graardor kills',
    metric: MetricEnum.GENERAL_GRAARDOR,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Giant Mole kills',
    metric: MetricEnum.GIANT_MOLE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Grotesque Guardians kills',
    metric: MetricEnum.GROTESQUE_GUARDIANS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Hespori kills',
    metric: MetricEnum.HESPORI,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Kalphite Queen kills',
    metric: MetricEnum.KALPHITE_QUEEN,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} King Black Dragon kills',
    metric: MetricEnum.KING_BLACK_DRAGON,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Kraken kills',
    metric: MetricEnum.KRAKEN,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Kree'Arra kills",
    metric: MetricEnum.KREEARRA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} K'ril Tsutsaroth kills",
    metric: MetricEnum.KRIL_TSUTSAROTH,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Mimic kills',
    metric: MetricEnum.MIMIC,
    thresholds: [10, 50, 100, 200]
  },
  {
    name: '{threshold} Nex kills',
    metric: MetricEnum.NEX,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Nightmare kills',
    metric: MetricEnum.NIGHTMARE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Phosani's Nightmare kills",
    metric: MetricEnum.PHOSANIS_NIGHTMARE,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Obor kills',
    metric: MetricEnum.OBOR,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Sarachnis kills',
    metric: MetricEnum.SARACHNIS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Scorpia kills',
    metric: MetricEnum.SCORPIA,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Skotizo kills',
    metric: MetricEnum.SKOTIZO,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Tempoross kills',
    metric: MetricEnum.TEMPOROSS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} The Gauntlet kills',
    metric: MetricEnum.THE_GAUNTLET,
    thresholds: [100, 200, 1000, 2000]
  },
  {
    name: '{threshold} The Corrupted Gauntlet kills',
    metric: MetricEnum.THE_CORRUPTED_GAUNTLET,
    thresholds: [100, 200, 1000, 2000]
  },
  {
    name: '{threshold} Theatre Of Blood kills',
    metric: MetricEnum.THEATRE_OF_BLOOD,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Theatre Of Blood (HM) kills',
    metric: MetricEnum.THEATRE_OF_BLOOD_HARD_MODE,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Thermonuclear Smoke Devil kills',
    metric: MetricEnum.THERMONUCLEAR_SMOKE_DEVIL,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} TzKal-Zuk kills',
    metric: MetricEnum.TZKAL_ZUK,
    thresholds: [10, 50, 100, 200]
  },
  {
    name: '{threshold} TzTok-Jad kills',
    metric: MetricEnum.TZTOK_JAD,
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Venenatis kills',
    metric: MetricEnum.VENENATIS,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Vet'ion kills",
    metric: MetricEnum.VETION,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Vorkath kills',
    metric: MetricEnum.VORKATH,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Wintertodt kills',
    metric: MetricEnum.WINTERTODT,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Zalcano kills',
    metric: MetricEnum.ZALCANO,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Zulrah kills',
    metric: MetricEnum.ZULRAH,
    thresholds: [500, 1000, 5000, 10_000]
  },
  // ---------------------
  // ACTIVITY ACHIEVEMENTS
  // ---------------------
  {
    name: '{threshold} Bounty Hunter (Hunter) score',
    metric: MetricEnum.BOUNTY_HUNTER_HUNTER,
    thresholds: [1000, 5000, 10_000]
  },
  {
    name: '{threshold} Bounty Hunter (Rogue) score',
    metric: MetricEnum.BOUNTY_HUNTER_ROGUE,
    thresholds: [1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (All)',
    metric: MetricEnum.CLUE_SCROLLS_ALL,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Beginner)',
    metric: MetricEnum.CLUE_SCROLLS_BEGINNER,
    thresholds: [200, 500, 1000, 5000]
  },
  {
    name: '{threshold} Clue Scrolls (Easy)',
    metric: MetricEnum.CLUE_SCROLLS_EASY,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Medium)',
    metric: MetricEnum.CLUE_SCROLLS_MEDIUM,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Hard)',
    metric: MetricEnum.CLUE_SCROLLS_HARD,
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Elite)',
    metric: MetricEnum.CLUE_SCROLLS_ELITE,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Clue Scrolls (Master)',
    metric: MetricEnum.CLUE_SCROLLS_MASTER,
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Last Man Standing score',
    metric: MetricEnum.LAST_MAN_STANDING,
    thresholds: [2000, 5000, 10_000, 15_000]
  },
  {
    name: '{threshold} Soul Wars Zeal',
    metric: MetricEnum.SOUL_WARS_ZEAL,
    thresholds: [5000, 10_000, 20_000]
  }
];
