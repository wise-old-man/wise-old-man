import {
  Metric as PrismaMetric,
  Period as PrismaPeriod,
  PlayerType as PrismaPlayerType,
  PlayerBuild as PrismaPlayerBuild,
  NameChangeStatus as PrismaNameChangeStatus
} from '@prisma/client';

/**
 * Prisma currently seems to ignore the @map() in enum declarations.
 *
 * So by declaring this enum in the schema file:
 *
 * enum NameChangeStatus {
 *    PENDING     @map('pending')
 *    DENIED      @map('denied')
 *    APPROVED    @map('approved')
 * }
 *
 * you would expect the prisma client to then generate the following object:
 *
 * const NameChangeStatus = {
 *    PENDING: 'pending',
 *    DENIED: 'denied',
 *    APPROVED: 'approved',
 * }
 *
 * but unfortunately, the mapping is only used for queries, and the actual esulting object is this:
 *
 * const NameChangeStatus = {
 *    PENDING: 'PENDING',
 *    DENIED: 'DENIED',
 *    APPROVED: 'APPROVED',
 * }
 *
 * And because I'd hate having to call enum values in lowercase, like:
 *    NameChangeStatus.pending
 *    Metric.king_black_dragon
 *    Period.day
 *
 * I'd rather do some mapping to ensure I have the best of both worlds,
 * lowercase database values, but with uppercase in code.
 * With the mappings below, we can now use prisma enums by calling them with uppercase, like:
 *
 *    NameChangeStatus.PENDING
 *    Metric.KING_BLACK_DRAGON
 *    Period.DAY
 *
 */

export const SkillEnum = {
  OVERALL: PrismaMetric.overall,
  ATTACK: PrismaMetric.attack,
  DEFENCE: PrismaMetric.defence,
  STRENGTH: PrismaMetric.strength,
  HITPOINTS: PrismaMetric.hitpoints,
  RANGED: PrismaMetric.ranged,
  PRAYER: PrismaMetric.prayer,
  MAGIC: PrismaMetric.magic,
  COOKING: PrismaMetric.cooking,
  WOODCUTTING: PrismaMetric.woodcutting,
  FLETCHING: PrismaMetric.fletching,
  FISHING: PrismaMetric.fishing,
  FIREMAKING: PrismaMetric.firemaking,
  CRAFTING: PrismaMetric.crafting,
  SMITHING: PrismaMetric.smithing,
  MINING: PrismaMetric.mining,
  HERBLORE: PrismaMetric.herblore,
  AGILITY: PrismaMetric.agility,
  THIEVING: PrismaMetric.thieving,
  SLAYER: PrismaMetric.slayer,
  FARMING: PrismaMetric.farming,
  RUNECRAFTING: PrismaMetric.runecrafting,
  HUNTER: PrismaMetric.hunter,
  CONSTRUCTION: PrismaMetric.construction
} as const;

export const ActivityEnum = {
  LEAGUE_POINTS: PrismaMetric.league_points,
  BOUNTY_HUNTER_HUNTER: PrismaMetric.bounty_hunter_hunter,
  BOUNTY_HUNTER_ROGUE: PrismaMetric.bounty_hunter_rogue,
  CLUE_SCROLLS_ALL: PrismaMetric.clue_scrolls_all,
  CLUE_SCROLLS_BEGINNER: PrismaMetric.clue_scrolls_beginner,
  CLUE_SCROLLS_EASY: PrismaMetric.clue_scrolls_easy,
  CLUE_SCROLLS_MEDIUM: PrismaMetric.clue_scrolls_medium,
  CLUE_SCROLLS_HARD: PrismaMetric.clue_scrolls_hard,
  CLUE_SCROLLS_ELITE: PrismaMetric.clue_scrolls_elite,
  CLUE_SCROLLS_MASTER: PrismaMetric.clue_scrolls_master,
  LAST_MAN_STANDING: PrismaMetric.last_man_standing,
  SOUL_WARS_ZEAL: PrismaMetric.soul_wars_zeal,
  GUARDIANS_OF_THE_RIFT: PrismaMetric.guardians_of_the_rift
};

export const BossEnum = {
  ABYSSAL_SIRE: PrismaMetric.abyssal_sire,
  ALCHEMICAL_HYDRA: PrismaMetric.alchemical_hydra,
  BARROWS_CHESTS: PrismaMetric.barrows_chests,
  BRYOPHYTA: PrismaMetric.bryophyta,
  CALLISTO: PrismaMetric.callisto,
  CERBERUS: PrismaMetric.cerberus,
  CHAMBERS_OF_XERIC: PrismaMetric.chambers_of_xeric,
  CHAMBERS_OF_XERIC_CM: PrismaMetric.chambers_of_xeric_challenge_mode,
  CHAOS_ELEMENTAL: PrismaMetric.chaos_elemental,
  CHAOS_FANATIC: PrismaMetric.chaos_fanatic,
  COMMANDER_ZILYANA: PrismaMetric.commander_zilyana,
  CORPOREAL_BEAST: PrismaMetric.corporeal_beast,
  CRAZY_ARCHAEOLOGIST: PrismaMetric.crazy_archaeologist,
  DAGANNOTH_PRIME: PrismaMetric.dagannoth_prime,
  DAGANNOTH_REX: PrismaMetric.dagannoth_rex,
  DAGANNOTH_SUPREME: PrismaMetric.dagannoth_supreme,
  DERANGED_ARCHAEOLOGIST: PrismaMetric.deranged_archaeologist,
  GENERAL_GRAARDOR: PrismaMetric.general_graardor,
  GIANT_MOLE: PrismaMetric.giant_mole,
  GROTESQUE_GUARDIANS: PrismaMetric.grotesque_guardians,
  HESPORI: PrismaMetric.hespori,
  KALPHITE_QUEEN: PrismaMetric.kalphite_queen,
  KING_BLACK_DRAGON: PrismaMetric.king_black_dragon,
  KRAKEN: PrismaMetric.kraken,
  KREEARRA: PrismaMetric.kreearra,
  KRIL_TSUTSAROTH: PrismaMetric.kril_tsutsaroth,
  MIMIC: PrismaMetric.mimic,
  NEX: PrismaMetric.nex,
  NIGHTMARE: PrismaMetric.nightmare,
  PHOSANIS_NIGHTMARE: PrismaMetric.phosanis_nightmare,
  OBOR: PrismaMetric.obor,
  SARACHNIS: PrismaMetric.sarachnis,
  SCORPIA: PrismaMetric.scorpia,
  SKOTIZO: PrismaMetric.skotizo,
  TEMPOROSS: PrismaMetric.tempoross,
  THE_GAUNTLET: PrismaMetric.the_gauntlet,
  THE_CORRUPTED_GAUNTLET: PrismaMetric.the_corrupted_gauntlet,
  THEATRE_OF_BLOOD: PrismaMetric.theatre_of_blood,
  THEATRE_OF_BLOOD_HARD_MODE: PrismaMetric.theatre_of_blood_hard_mode,
  THERMONUCLEAR_SMOKE_DEVIL: PrismaMetric.thermonuclear_smoke_devil,
  TZKAL_ZUK: PrismaMetric.tzkal_zuk,
  TZTOK_JAD: PrismaMetric.tztok_jad,
  VENENATIS: PrismaMetric.venenatis,
  VETION: PrismaMetric.vetion,
  VORKATH: PrismaMetric.vorkath,
  WINTERTODT: PrismaMetric.wintertodt,
  ZALCANO: PrismaMetric.zalcano,
  ZULRAH: PrismaMetric.zulrah
} as const;

export const VirtualEnum = {
  EHP: PrismaMetric.ehp,
  EHB: PrismaMetric.ehb
} as const;

export const MetricEnum = {
  ...SkillEnum,
  ...ActivityEnum,
  ...BossEnum,
  ...VirtualEnum
} as const;

export type SkillEnum = typeof SkillEnum[keyof typeof SkillEnum];
export type ActivityEnum = typeof ActivityEnum[keyof typeof ActivityEnum];
export type BossEnum = typeof BossEnum[keyof typeof BossEnum];
export type VirtualEnum = typeof VirtualEnum[keyof typeof VirtualEnum];
export type MetricEnum = typeof MetricEnum[keyof typeof MetricEnum];

export const NameChangeStatus = {
  PENDING: PrismaNameChangeStatus.pending,
  DENIED: PrismaNameChangeStatus.denied,
  APPROVED: PrismaNameChangeStatus.approved
} as const;

export type NameChangeStatus = typeof NameChangeStatus[keyof typeof NameChangeStatus];

export const PeriodEnum = {
  FIVE_MIN: PrismaPeriod.five_min,
  DAY: PrismaPeriod.day,
  WEEK: PrismaPeriod.week,
  MONTH: PrismaPeriod.month,
  YEAR: PrismaPeriod.year
} as const;

export type PeriodEnum = typeof PeriodEnum[keyof typeof PeriodEnum];

export const PlayerTypeEnum = {
  UNKNOWN: PrismaPlayerType.unknown,
  REGULAR: PrismaPlayerType.regular,
  IRONMAN: PrismaPlayerType.ironman,
  HARDCORE: PrismaPlayerType.hardcore,
  ULTIMATE: PrismaPlayerType.ultimate
} as const;

export type PlayerTypeEnum = typeof PlayerTypeEnum[keyof typeof PlayerTypeEnum];

export const PlayerBuildEnum = {
  MAIN: PrismaPlayerBuild.main,
  F2P: PrismaPlayerBuild.f2p,
  LVL3: PrismaPlayerBuild.lvl3,
  ZERKER: PrismaPlayerBuild.zerker,
  DEF1: PrismaPlayerBuild.def1,
  HP10: PrismaPlayerBuild.hp10
} as const;

export type PlayerBuildEnum = typeof PlayerBuildEnum[keyof typeof PlayerBuildEnum];
