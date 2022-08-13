import {
  Metric as PrismaMetric,
  Period as PrismaPeriod,
  PlayerType as PrismaPlayerType,
  PlayerBuild as PrismaPlayerBuild,
  GroupRole as PrismaGroupRole,
  NameChangeStatus as PrismaNameChangeStatus,
  CompetitionType as PrismaCompetitionType
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
  PVP_ARENA: PrismaMetric.pvp_arena,
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

export const CompetitionTypeEnum = {
  CLASSIC: PrismaCompetitionType.classic,
  TEAM: PrismaCompetitionType.team
} as const;

export type CompetitionTypeEnum = typeof CompetitionTypeEnum[keyof typeof CompetitionTypeEnum];

export const GroupRoleEnum = {
  ACHIEVER: PrismaGroupRole.achiever,
  ADAMANT: PrismaGroupRole.adamant,
  ADEPT: PrismaGroupRole.adept,
  ADMINISTRATOR: PrismaGroupRole.administrator,
  ADMIRAL: PrismaGroupRole.admiral,
  ADVENTURER: PrismaGroupRole.adventurer,
  AIR: PrismaGroupRole.air,
  ANCHOR: PrismaGroupRole.anchor,
  APOTHECARY: PrismaGroupRole.apothecary,
  ARCHER: PrismaGroupRole.archer,
  ARMADYLEAN: PrismaGroupRole.armadylean,
  ARTILLERY: PrismaGroupRole.artillery,
  ARTISAN: PrismaGroupRole.artisan,
  ASGARNIAN: PrismaGroupRole.asgarnian,
  ASSASSIN: PrismaGroupRole.assassin,
  ASSISTANT: PrismaGroupRole.assistant,
  ASTRAL: PrismaGroupRole.astral,
  ATHLETE: PrismaGroupRole.athlete,
  ATTACKER: PrismaGroupRole.attacker,
  BANDIT: PrismaGroupRole.bandit,
  BANDOSIAN: PrismaGroupRole.bandosian,
  BARBARIAN: PrismaGroupRole.barbarian,
  BATTLEMAGE: PrismaGroupRole.battlemage,
  BEAST: PrismaGroupRole.beast,
  BERSERKER: PrismaGroupRole.berserker,
  BLISTERWOOD: PrismaGroupRole.blisterwood,
  BLOOD: PrismaGroupRole.blood,
  BLUE: PrismaGroupRole.blue,
  BOB: PrismaGroupRole.bob,
  BODY: PrismaGroupRole.body,
  BRASSICAN: PrismaGroupRole.brassican,
  BRAWLER: PrismaGroupRole.brawler,
  BRIGADIER: PrismaGroupRole.brigadier,
  BRIGAND: PrismaGroupRole.brigand,
  BRONZE: PrismaGroupRole.bronze,
  BRUISER: PrismaGroupRole.bruiser,
  BULWARK: PrismaGroupRole.bulwark,
  BURGLAR: PrismaGroupRole.burglar,
  BURNT: PrismaGroupRole.burnt,
  CADET: PrismaGroupRole.cadet,
  CAPTAIN: PrismaGroupRole.captain,
  CARRY: PrismaGroupRole.carry,
  CHAMPION: PrismaGroupRole.champion,
  CHAOS: PrismaGroupRole.chaos,
  CLERIC: PrismaGroupRole.cleric,
  COLLECTOR: PrismaGroupRole.collector,
  COLONEL: PrismaGroupRole.colonel,
  COMMANDER: PrismaGroupRole.commander,
  COMPETITOR: PrismaGroupRole.competitor,
  COMPLETIONIST: PrismaGroupRole.completionist,
  CONSTRUCTOR: PrismaGroupRole.constructor,
  COOK: PrismaGroupRole.cook,
  COORDINATOR: PrismaGroupRole.coordinator,
  CORPORAL: PrismaGroupRole.corporal,
  COSMIC: PrismaGroupRole.cosmic,
  COUNCILLOR: PrismaGroupRole.councillor,
  CRAFTER: PrismaGroupRole.crafter,
  CREW: PrismaGroupRole.crew,
  CRUSADER: PrismaGroupRole.crusader,
  CUTPURSE: PrismaGroupRole.cutpurse,
  DEATH: PrismaGroupRole.death,
  DEFENDER: PrismaGroupRole.defender,
  DEFILER: PrismaGroupRole.defiler,
  DEPUTY_OWNER: PrismaGroupRole.deputy_owner,
  DESTROYER: PrismaGroupRole.destroyer,
  DIAMOND: PrismaGroupRole.diamond,
  DISEASED: PrismaGroupRole.diseased,
  DOCTOR: PrismaGroupRole.doctor,
  DOGSBODY: PrismaGroupRole.dogsbody,
  DRAGON: PrismaGroupRole.dragon,
  DRAGONSTONE: PrismaGroupRole.dragonstone,
  DRUID: PrismaGroupRole.druid,
  DUELLIST: PrismaGroupRole.duellist,
  EARTH: PrismaGroupRole.earth,
  ELITE: PrismaGroupRole.elite,
  EMERALD: PrismaGroupRole.emerald,
  ENFORCER: PrismaGroupRole.enforcer,
  EPIC: PrismaGroupRole.epic,
  EXECUTIVE: PrismaGroupRole.executive,
  EXPERT: PrismaGroupRole.expert,
  EXPLORER: PrismaGroupRole.explorer,
  FARMER: PrismaGroupRole.farmer,
  FEEDER: PrismaGroupRole.feeder,
  FIGHTER: PrismaGroupRole.fighter,
  FIRE: PrismaGroupRole.fire,
  FIREMAKER: PrismaGroupRole.firemaker,
  FIRESTARTER: PrismaGroupRole.firestarter,
  FISHER: PrismaGroupRole.fisher,
  FLETCHER: PrismaGroupRole.fletcher,
  FORAGER: PrismaGroupRole.forager,
  FREMENNIK: PrismaGroupRole.fremennik,
  GAMER: PrismaGroupRole.gamer,
  GATHERER: PrismaGroupRole.gatherer,
  GENERAL: PrismaGroupRole.general,
  GNOME_CHILD: PrismaGroupRole.gnome_child,
  GNOME_ELDER: PrismaGroupRole.gnome_elder,
  GOBLIN: PrismaGroupRole.goblin,
  GOLD: PrismaGroupRole.gold,
  GOON: PrismaGroupRole.goon,
  GREEN: PrismaGroupRole.green,
  GREY: PrismaGroupRole.grey,
  GUARDIAN: PrismaGroupRole.guardian,
  GUTHIXIAN: PrismaGroupRole.guthixian,
  HARPOON: PrismaGroupRole.harpoon,
  HEALER: PrismaGroupRole.healer,
  HELLCAT: PrismaGroupRole.hellcat,
  HELPER: PrismaGroupRole.helper,
  HERBOLOGIST: PrismaGroupRole.herbologist,
  HERO: PrismaGroupRole.hero,
  HOLY: PrismaGroupRole.holy,
  HOARDER: PrismaGroupRole.hoarder,
  HUNTER: PrismaGroupRole.hunter,
  IGNITOR: PrismaGroupRole.ignitor,
  ILLUSIONIST: PrismaGroupRole.illusionist,
  IMP: PrismaGroupRole.imp,
  INFANTRY: PrismaGroupRole.infantry,
  INQUISITOR: PrismaGroupRole.inquisitor,
  IRON: PrismaGroupRole.iron,
  JADE: PrismaGroupRole.jade,
  JUSTICIAR: PrismaGroupRole.justiciar,
  KANDARIN: PrismaGroupRole.kandarin,
  KARAMJAN: PrismaGroupRole.karamjan,
  KHARIDIAN: PrismaGroupRole.kharidian,
  KITTEN: PrismaGroupRole.kitten,
  KNIGHT: PrismaGroupRole.knight,
  LABOURER: PrismaGroupRole.labourer,
  LAW: PrismaGroupRole.law,
  LEADER: PrismaGroupRole.leader,
  LEARNER: PrismaGroupRole.learner,
  LEGACY: PrismaGroupRole.legacy,
  LEGEND: PrismaGroupRole.legend,
  LEGIONNAIRE: PrismaGroupRole.legionnaire,
  LIEUTENANT: PrismaGroupRole.lieutenant,
  LOOTER: PrismaGroupRole.looter,
  LUMBERJACK: PrismaGroupRole.lumberjack,
  MAGIC: PrismaGroupRole.magic,
  MAGICIAN: PrismaGroupRole.magician,
  MAJOR: PrismaGroupRole.major,
  MAPLE: PrismaGroupRole.maple,
  MARSHAL: PrismaGroupRole.marshal,
  MASTER: PrismaGroupRole.master,
  MAXED: PrismaGroupRole.maxed,
  MEDIATOR: PrismaGroupRole.mediator,
  MEDIC: PrismaGroupRole.medic,
  MENTOR: PrismaGroupRole.mentor,
  MEMBER: PrismaGroupRole.member,
  MERCHANT: PrismaGroupRole.merchant,
  MIND: PrismaGroupRole.mind,
  MINER: PrismaGroupRole.miner,
  MINION: PrismaGroupRole.minion,
  MISTHALINIAN: PrismaGroupRole.misthalinian,
  MITHRIL: PrismaGroupRole.mithril,
  MODERATOR: PrismaGroupRole.moderator,
  MONARCH: PrismaGroupRole.monarch,
  MORYTANIAN: PrismaGroupRole.morytanian,
  MYSTIC: PrismaGroupRole.mystic,
  MYTH: PrismaGroupRole.myth,
  NATURAL: PrismaGroupRole.natural,
  NATURE: PrismaGroupRole.nature,
  NECROMANCER: PrismaGroupRole.necromancer,
  NINJA: PrismaGroupRole.ninja,
  NOBLE: PrismaGroupRole.noble,
  NOVICE: PrismaGroupRole.novice,
  NURSE: PrismaGroupRole.nurse,
  OAK: PrismaGroupRole.oak,
  OFFICER: PrismaGroupRole.officer,
  ONYX: PrismaGroupRole.onyx,
  OPAL: PrismaGroupRole.opal,
  ORACLE: PrismaGroupRole.oracle,
  ORANGE: PrismaGroupRole.orange,
  OWNER: PrismaGroupRole.owner,
  PAGE: PrismaGroupRole.page,
  PALADIN: PrismaGroupRole.paladin,
  PAWN: PrismaGroupRole.pawn,
  PILGRIM: PrismaGroupRole.pilgrim,
  PINE: PrismaGroupRole.pine,
  PINK: PrismaGroupRole.pink,
  PREFECT: PrismaGroupRole.prefect,
  PRIEST: PrismaGroupRole.priest,
  PRIVATE: PrismaGroupRole.private,
  PRODIGY: PrismaGroupRole.prodigy,
  PROSELYTE: PrismaGroupRole.proselyte,
  PROSPECTOR: PrismaGroupRole.prospector,
  PROTECTOR: PrismaGroupRole.protector,
  PURE: PrismaGroupRole.pure,
  PURPLE: PrismaGroupRole.purple,
  PYROMANCER: PrismaGroupRole.pyromancer,
  QUESTER: PrismaGroupRole.quester,
  RACER: PrismaGroupRole.racer,
  RAIDER: PrismaGroupRole.raider,
  RANGER: PrismaGroupRole.ranger,
  RECORD_CHASER: PrismaGroupRole.record_chaser,
  RECRUIT: PrismaGroupRole.recruit,
  RECRUITER: PrismaGroupRole.recruiter,
  RED_TOPAZ: PrismaGroupRole.red_topaz,
  RED: PrismaGroupRole.red,
  ROGUE: PrismaGroupRole.rogue,
  RUBY: PrismaGroupRole.ruby,
  RUNE: PrismaGroupRole.rune,
  RUNECRAFTER: PrismaGroupRole.runecrafter,
  SAGE: PrismaGroupRole.sage,
  SAPPHIRE: PrismaGroupRole.sapphire,
  SARADOMINIST: PrismaGroupRole.saradominist,
  SAVIOUR: PrismaGroupRole.saviour,
  SCAVENGER: PrismaGroupRole.scavenger,
  SCHOLAR: PrismaGroupRole.scholar,
  SCOURGE: PrismaGroupRole.scourge,
  SCOUT: PrismaGroupRole.scout,
  SCRIBE: PrismaGroupRole.scribe,
  SEER: PrismaGroupRole.seer,
  SENATOR: PrismaGroupRole.senator,
  SENTRY: PrismaGroupRole.sentry,
  SERENIST: PrismaGroupRole.serenist,
  SERGEANT: PrismaGroupRole.sergeant,
  SHAMAN: PrismaGroupRole.shaman,
  SHERIFF: PrismaGroupRole.sheriff,
  SHORT_GREEN_GUY: PrismaGroupRole.short_green_guy,
  SKILLER: PrismaGroupRole.skiller,
  SKULLED: PrismaGroupRole.skulled,
  SLAYER: PrismaGroupRole.slayer,
  SMITER: PrismaGroupRole.smiter,
  SMITH: PrismaGroupRole.smith,
  SMUGGLER: PrismaGroupRole.smuggler,
  SNIPER: PrismaGroupRole.sniper,
  SOUL: PrismaGroupRole.soul,
  SPECIALIST: PrismaGroupRole.specialist,
  SPEED_RUNNER: PrismaGroupRole.speed_runner,
  SPELLCASTER: PrismaGroupRole.spellcaster,
  SQUIRE: PrismaGroupRole.squire,
  STAFF: PrismaGroupRole.staff,
  STEEL: PrismaGroupRole.steel,
  STRIDER: PrismaGroupRole.strider,
  STRIKER: PrismaGroupRole.striker,
  SUMMONER: PrismaGroupRole.summoner,
  SUPERIOR: PrismaGroupRole.superior,
  SUPERVISOR: PrismaGroupRole.supervisor,
  TEACHER: PrismaGroupRole.teacher,
  TEMPLAR: PrismaGroupRole.templar,
  THERAPIST: PrismaGroupRole.therapist,
  THIEF: PrismaGroupRole.thief,
  TIRANNIAN: PrismaGroupRole.tirannian,
  TRIALIST: PrismaGroupRole.trialist,
  TRICKSTER: PrismaGroupRole.trickster,
  TZKAL: PrismaGroupRole.tzkal,
  TZTOK: PrismaGroupRole.tztok,
  UNHOLY: PrismaGroupRole.unholy,
  VAGRANT: PrismaGroupRole.vagrant,
  VANGUARD: PrismaGroupRole.vanguard,
  WALKER: PrismaGroupRole.walker,
  WANDERER: PrismaGroupRole.wanderer,
  WARDEN: PrismaGroupRole.warden,
  WARLOCK: PrismaGroupRole.warlock,
  WARRIOR: PrismaGroupRole.warrior,
  WATER: PrismaGroupRole.water,
  WILD: PrismaGroupRole.wild,
  WILLOW: PrismaGroupRole.willow,
  WILY: PrismaGroupRole.wily,
  WINTUMBER: PrismaGroupRole.wintumber,
  WITCH: PrismaGroupRole.witch,
  WIZARD: PrismaGroupRole.wizard,
  WORKER: PrismaGroupRole.worker,
  WRATH: PrismaGroupRole.wrath,
  XERICIAN: PrismaGroupRole.xerician,
  YELLOW: PrismaGroupRole.yellow,
  YEW: PrismaGroupRole.yew,
  ZAMORAKIAN: PrismaGroupRole.zamorakian,
  ZAROSIAN: PrismaGroupRole.zarosian,
  ZEALOT: PrismaGroupRole.zealot,
  ZENYTE: PrismaGroupRole.zenyte
} as const;

export type GroupRoleEnum = typeof GroupRoleEnum[keyof typeof GroupRoleEnum];
