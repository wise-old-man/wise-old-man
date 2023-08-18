import prisma from '@prisma/client';

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

export const Skill = {
  OVERALL: prisma.Metric.overall,
  ATTACK: prisma.Metric.attack,
  DEFENCE: prisma.Metric.defence,
  STRENGTH: prisma.Metric.strength,
  HITPOINTS: prisma.Metric.hitpoints,
  RANGED: prisma.Metric.ranged,
  PRAYER: prisma.Metric.prayer,
  MAGIC: prisma.Metric.magic,
  COOKING: prisma.Metric.cooking,
  WOODCUTTING: prisma.Metric.woodcutting,
  FLETCHING: prisma.Metric.fletching,
  FISHING: prisma.Metric.fishing,
  FIREMAKING: prisma.Metric.firemaking,
  CRAFTING: prisma.Metric.crafting,
  SMITHING: prisma.Metric.smithing,
  MINING: prisma.Metric.mining,
  HERBLORE: prisma.Metric.herblore,
  AGILITY: prisma.Metric.agility,
  THIEVING: prisma.Metric.thieving,
  SLAYER: prisma.Metric.slayer,
  FARMING: prisma.Metric.farming,
  RUNECRAFTING: prisma.Metric.runecrafting,
  HUNTER: prisma.Metric.hunter,
  CONSTRUCTION: prisma.Metric.construction
} as const;

export const Activity = {
  LEAGUE_POINTS: prisma.Metric.league_points,
  BOUNTY_HUNTER_HUNTER: prisma.Metric.bounty_hunter_hunter,
  BOUNTY_HUNTER_ROGUE: prisma.Metric.bounty_hunter_rogue,
  CLUE_SCROLLS_ALL: prisma.Metric.clue_scrolls_all,
  CLUE_SCROLLS_BEGINNER: prisma.Metric.clue_scrolls_beginner,
  CLUE_SCROLLS_EASY: prisma.Metric.clue_scrolls_easy,
  CLUE_SCROLLS_MEDIUM: prisma.Metric.clue_scrolls_medium,
  CLUE_SCROLLS_HARD: prisma.Metric.clue_scrolls_hard,
  CLUE_SCROLLS_ELITE: prisma.Metric.clue_scrolls_elite,
  CLUE_SCROLLS_MASTER: prisma.Metric.clue_scrolls_master,
  LAST_MAN_STANDING: prisma.Metric.last_man_standing,
  PVP_ARENA: prisma.Metric.pvp_arena,
  SOUL_WARS_ZEAL: prisma.Metric.soul_wars_zeal,
  GUARDIANS_OF_THE_RIFT: prisma.Metric.guardians_of_the_rift
} as const;

export const Boss = {
  ABYSSAL_SIRE: prisma.Metric.abyssal_sire,
  ALCHEMICAL_HYDRA: prisma.Metric.alchemical_hydra,
  ARTIO: prisma.Metric.artio,
  BARROWS_CHESTS: prisma.Metric.barrows_chests,
  BRYOPHYTA: prisma.Metric.bryophyta,
  CALLISTO: prisma.Metric.callisto,
  CALVARION: prisma.Metric.calvarion,
  CERBERUS: prisma.Metric.cerberus,
  CHAMBERS_OF_XERIC: prisma.Metric.chambers_of_xeric,
  CHAMBERS_OF_XERIC_CM: prisma.Metric.chambers_of_xeric_challenge_mode,
  CHAOS_ELEMENTAL: prisma.Metric.chaos_elemental,
  CHAOS_FANATIC: prisma.Metric.chaos_fanatic,
  COMMANDER_ZILYANA: prisma.Metric.commander_zilyana,
  CORPOREAL_BEAST: prisma.Metric.corporeal_beast,
  CRAZY_ARCHAEOLOGIST: prisma.Metric.crazy_archaeologist,
  DAGANNOTH_PRIME: prisma.Metric.dagannoth_prime,
  DAGANNOTH_REX: prisma.Metric.dagannoth_rex,
  DAGANNOTH_SUPREME: prisma.Metric.dagannoth_supreme,
  DERANGED_ARCHAEOLOGIST: prisma.Metric.deranged_archaeologist,
  DUKE_SUCELLUS: prisma.Metric.duke_sucellus,
  GENERAL_GRAARDOR: prisma.Metric.general_graardor,
  GIANT_MOLE: prisma.Metric.giant_mole,
  GROTESQUE_GUARDIANS: prisma.Metric.grotesque_guardians,
  HESPORI: prisma.Metric.hespori,
  KALPHITE_QUEEN: prisma.Metric.kalphite_queen,
  KING_BLACK_DRAGON: prisma.Metric.king_black_dragon,
  KRAKEN: prisma.Metric.kraken,
  KREEARRA: prisma.Metric.kreearra,
  KRIL_TSUTSAROTH: prisma.Metric.kril_tsutsaroth,
  MIMIC: prisma.Metric.mimic,
  NEX: prisma.Metric.nex,
  NIGHTMARE: prisma.Metric.nightmare,
  PHOSANIS_NIGHTMARE: prisma.Metric.phosanis_nightmare,
  OBOR: prisma.Metric.obor,
  PHANTOM_MUSPAH: prisma.Metric.phantom_muspah,
  SARACHNIS: prisma.Metric.sarachnis,
  SCORPIA: prisma.Metric.scorpia,
  SKOTIZO: prisma.Metric.skotizo,
  SPINDEL: prisma.Metric.spindel,
  TEMPOROSS: prisma.Metric.tempoross,
  THE_GAUNTLET: prisma.Metric.the_gauntlet,
  THE_CORRUPTED_GAUNTLET: prisma.Metric.the_corrupted_gauntlet,
  THE_LEVIATHAN: prisma.Metric.the_leviathan,
  THE_WHISPERER: prisma.Metric.the_whisperer,
  THEATRE_OF_BLOOD: prisma.Metric.theatre_of_blood,
  THEATRE_OF_BLOOD_HARD_MODE: prisma.Metric.theatre_of_blood_hard_mode,
  THERMONUCLEAR_SMOKE_DEVIL: prisma.Metric.thermonuclear_smoke_devil,
  TOMBS_OF_AMASCUT: prisma.Metric.tombs_of_amascut,
  TOMBS_OF_AMASCUT_EXPERT: prisma.Metric.tombs_of_amascut_expert,
  TZKAL_ZUK: prisma.Metric.tzkal_zuk,
  TZTOK_JAD: prisma.Metric.tztok_jad,
  VARDORVIS: prisma.Metric.vardorvis,
  VENENATIS: prisma.Metric.venenatis,
  VETION: prisma.Metric.vetion,
  VORKATH: prisma.Metric.vorkath,
  WINTERTODT: prisma.Metric.wintertodt,
  ZALCANO: prisma.Metric.zalcano,
  ZULRAH: prisma.Metric.zulrah
} as const;

export const ComputedMetric = {
  EHP: prisma.Metric.ehp,
  EHB: prisma.Metric.ehb
} as const;

export const Metric = {
  ...Skill,
  ...Activity,
  ...Boss,
  ...ComputedMetric
} as const;

export type Skill = typeof Skill[keyof typeof Skill];
export type Activity = typeof Activity[keyof typeof Activity];
export type Boss = typeof Boss[keyof typeof Boss];
export type ComputedMetric = typeof ComputedMetric[keyof typeof ComputedMetric];
export type Metric = typeof Metric[keyof typeof Metric];

export const NameChangeStatus = {
  PENDING: prisma.NameChangeStatus.pending,
  DENIED: prisma.NameChangeStatus.denied,
  APPROVED: prisma.NameChangeStatus.approved
} as const;

export type NameChangeStatus = typeof NameChangeStatus[keyof typeof NameChangeStatus];

export const Period = {
  FIVE_MIN: prisma.Period.five_min,
  DAY: prisma.Period.day,
  WEEK: prisma.Period.week,
  MONTH: prisma.Period.month,
  YEAR: prisma.Period.year
} as const;

export type Period = typeof Period[keyof typeof Period];

export const PlayerType = {
  UNKNOWN: prisma.PlayerType.unknown,
  REGULAR: prisma.PlayerType.regular,
  IRONMAN: prisma.PlayerType.ironman,
  HARDCORE: prisma.PlayerType.hardcore,
  ULTIMATE: prisma.PlayerType.ultimate
} as const;

export type PlayerType = typeof PlayerType[keyof typeof PlayerType];

export const PlayerBuild = {
  MAIN: prisma.PlayerBuild.main,
  F2P: prisma.PlayerBuild.f2p,
  LVL3: prisma.PlayerBuild.lvl3,
  ZERKER: prisma.PlayerBuild.zerker,
  DEF1: prisma.PlayerBuild.def1,
  HP10: prisma.PlayerBuild.hp10
} as const;

export type PlayerBuild = typeof PlayerBuild[keyof typeof PlayerBuild];

export const PlayerStatus = {
  ACTIVE: prisma.PlayerStatus.active,
  UNRANKED: prisma.PlayerStatus.unranked,
  FLAGGED: prisma.PlayerStatus.flagged,
  ARCHIVED: prisma.PlayerStatus.archived,
  BANNED: prisma.PlayerStatus.banned
} as const;

export type PlayerStatus = typeof PlayerStatus[keyof typeof PlayerStatus];

export const CompetitionType = {
  CLASSIC: prisma.CompetitionType.classic,
  TEAM: prisma.CompetitionType.team
} as const;

export type CompetitionType = typeof CompetitionType[keyof typeof CompetitionType];

export const GroupRole = {
  ACHIEVER: prisma.GroupRole.achiever,
  ADAMANT: prisma.GroupRole.adamant,
  ADEPT: prisma.GroupRole.adept,
  ADMINISTRATOR: prisma.GroupRole.administrator,
  ADMIRAL: prisma.GroupRole.admiral,
  ADVENTURER: prisma.GroupRole.adventurer,
  AIR: prisma.GroupRole.air,
  ANCHOR: prisma.GroupRole.anchor,
  APOTHECARY: prisma.GroupRole.apothecary,
  ARCHER: prisma.GroupRole.archer,
  ARMADYLEAN: prisma.GroupRole.armadylean,
  ARTILLERY: prisma.GroupRole.artillery,
  ARTISAN: prisma.GroupRole.artisan,
  ASGARNIAN: prisma.GroupRole.asgarnian,
  ASSASSIN: prisma.GroupRole.assassin,
  ASSISTANT: prisma.GroupRole.assistant,
  ASTRAL: prisma.GroupRole.astral,
  ATHLETE: prisma.GroupRole.athlete,
  ATTACKER: prisma.GroupRole.attacker,
  BANDIT: prisma.GroupRole.bandit,
  BANDOSIAN: prisma.GroupRole.bandosian,
  BARBARIAN: prisma.GroupRole.barbarian,
  BATTLEMAGE: prisma.GroupRole.battlemage,
  BEAST: prisma.GroupRole.beast,
  BERSERKER: prisma.GroupRole.berserker,
  BLISTERWOOD: prisma.GroupRole.blisterwood,
  BLOOD: prisma.GroupRole.blood,
  BLUE: prisma.GroupRole.blue,
  BOB: prisma.GroupRole.bob,
  BODY: prisma.GroupRole.body,
  BRASSICAN: prisma.GroupRole.brassican,
  BRAWLER: prisma.GroupRole.brawler,
  BRIGADIER: prisma.GroupRole.brigadier,
  BRIGAND: prisma.GroupRole.brigand,
  BRONZE: prisma.GroupRole.bronze,
  BRUISER: prisma.GroupRole.bruiser,
  BULWARK: prisma.GroupRole.bulwark,
  BURGLAR: prisma.GroupRole.burglar,
  BURNT: prisma.GroupRole.burnt,
  CADET: prisma.GroupRole.cadet,
  CAPTAIN: prisma.GroupRole.captain,
  CARRY: prisma.GroupRole.carry,
  CHAMPION: prisma.GroupRole.champion,
  CHAOS: prisma.GroupRole.chaos,
  CLERIC: prisma.GroupRole.cleric,
  COLLECTOR: prisma.GroupRole.collector,
  COLONEL: prisma.GroupRole.colonel,
  COMMANDER: prisma.GroupRole.commander,
  COMPETITOR: prisma.GroupRole.competitor,
  COMPLETIONIST: prisma.GroupRole.completionist,
  CONSTRUCTOR: prisma.GroupRole.constructor,
  COOK: prisma.GroupRole.cook,
  COORDINATOR: prisma.GroupRole.coordinator,
  CORPORAL: prisma.GroupRole.corporal,
  COSMIC: prisma.GroupRole.cosmic,
  COUNCILLOR: prisma.GroupRole.councillor,
  CRAFTER: prisma.GroupRole.crafter,
  CREW: prisma.GroupRole.crew,
  CRUSADER: prisma.GroupRole.crusader,
  CUTPURSE: prisma.GroupRole.cutpurse,
  DEATH: prisma.GroupRole.death,
  DEFENDER: prisma.GroupRole.defender,
  DEFILER: prisma.GroupRole.defiler,
  DEPUTY_OWNER: prisma.GroupRole.deputy_owner,
  DESTROYER: prisma.GroupRole.destroyer,
  DIAMOND: prisma.GroupRole.diamond,
  DISEASED: prisma.GroupRole.diseased,
  DOCTOR: prisma.GroupRole.doctor,
  DOGSBODY: prisma.GroupRole.dogsbody,
  DRAGON: prisma.GroupRole.dragon,
  DRAGONSTONE: prisma.GroupRole.dragonstone,
  DRUID: prisma.GroupRole.druid,
  DUELLIST: prisma.GroupRole.duellist,
  EARTH: prisma.GroupRole.earth,
  ELITE: prisma.GroupRole.elite,
  EMERALD: prisma.GroupRole.emerald,
  ENFORCER: prisma.GroupRole.enforcer,
  EPIC: prisma.GroupRole.epic,
  EXECUTIVE: prisma.GroupRole.executive,
  EXPERT: prisma.GroupRole.expert,
  EXPLORER: prisma.GroupRole.explorer,
  FARMER: prisma.GroupRole.farmer,
  FEEDER: prisma.GroupRole.feeder,
  FIGHTER: prisma.GroupRole.fighter,
  FIRE: prisma.GroupRole.fire,
  FIREMAKER: prisma.GroupRole.firemaker,
  FIRESTARTER: prisma.GroupRole.firestarter,
  FISHER: prisma.GroupRole.fisher,
  FLETCHER: prisma.GroupRole.fletcher,
  FORAGER: prisma.GroupRole.forager,
  FREMENNIK: prisma.GroupRole.fremennik,
  GAMER: prisma.GroupRole.gamer,
  GATHERER: prisma.GroupRole.gatherer,
  GENERAL: prisma.GroupRole.general,
  GNOME_CHILD: prisma.GroupRole.gnome_child,
  GNOME_ELDER: prisma.GroupRole.gnome_elder,
  GOBLIN: prisma.GroupRole.goblin,
  GOLD: prisma.GroupRole.gold,
  GOON: prisma.GroupRole.goon,
  GREEN: prisma.GroupRole.green,
  GREY: prisma.GroupRole.grey,
  GUARDIAN: prisma.GroupRole.guardian,
  GUTHIXIAN: prisma.GroupRole.guthixian,
  HARPOON: prisma.GroupRole.harpoon,
  HEALER: prisma.GroupRole.healer,
  HELLCAT: prisma.GroupRole.hellcat,
  HELPER: prisma.GroupRole.helper,
  HERBOLOGIST: prisma.GroupRole.herbologist,
  HERO: prisma.GroupRole.hero,
  HOLY: prisma.GroupRole.holy,
  HOARDER: prisma.GroupRole.hoarder,
  HUNTER: prisma.GroupRole.hunter,
  IGNITOR: prisma.GroupRole.ignitor,
  ILLUSIONIST: prisma.GroupRole.illusionist,
  IMP: prisma.GroupRole.imp,
  INFANTRY: prisma.GroupRole.infantry,
  INQUISITOR: prisma.GroupRole.inquisitor,
  IRON: prisma.GroupRole.iron,
  JADE: prisma.GroupRole.jade,
  JUSTICIAR: prisma.GroupRole.justiciar,
  KANDARIN: prisma.GroupRole.kandarin,
  KARAMJAN: prisma.GroupRole.karamjan,
  KHARIDIAN: prisma.GroupRole.kharidian,
  KITTEN: prisma.GroupRole.kitten,
  KNIGHT: prisma.GroupRole.knight,
  LABOURER: prisma.GroupRole.labourer,
  LAW: prisma.GroupRole.law,
  LEADER: prisma.GroupRole.leader,
  LEARNER: prisma.GroupRole.learner,
  LEGACY: prisma.GroupRole.legacy,
  LEGEND: prisma.GroupRole.legend,
  LEGIONNAIRE: prisma.GroupRole.legionnaire,
  LIEUTENANT: prisma.GroupRole.lieutenant,
  LOOTER: prisma.GroupRole.looter,
  LUMBERJACK: prisma.GroupRole.lumberjack,
  MAGIC: prisma.GroupRole.magic,
  MAGICIAN: prisma.GroupRole.magician,
  MAJOR: prisma.GroupRole.major,
  MAPLE: prisma.GroupRole.maple,
  MARSHAL: prisma.GroupRole.marshal,
  MASTER: prisma.GroupRole.master,
  MAXED: prisma.GroupRole.maxed,
  MEDIATOR: prisma.GroupRole.mediator,
  MEDIC: prisma.GroupRole.medic,
  MENTOR: prisma.GroupRole.mentor,
  MEMBER: prisma.GroupRole.member,
  MERCHANT: prisma.GroupRole.merchant,
  MIND: prisma.GroupRole.mind,
  MINER: prisma.GroupRole.miner,
  MINION: prisma.GroupRole.minion,
  MISTHALINIAN: prisma.GroupRole.misthalinian,
  MITHRIL: prisma.GroupRole.mithril,
  MODERATOR: prisma.GroupRole.moderator,
  MONARCH: prisma.GroupRole.monarch,
  MORYTANIAN: prisma.GroupRole.morytanian,
  MYSTIC: prisma.GroupRole.mystic,
  MYTH: prisma.GroupRole.myth,
  NATURAL: prisma.GroupRole.natural,
  NATURE: prisma.GroupRole.nature,
  NECROMANCER: prisma.GroupRole.necromancer,
  NINJA: prisma.GroupRole.ninja,
  NOBLE: prisma.GroupRole.noble,
  NOVICE: prisma.GroupRole.novice,
  NURSE: prisma.GroupRole.nurse,
  OAK: prisma.GroupRole.oak,
  OFFICER: prisma.GroupRole.officer,
  ONYX: prisma.GroupRole.onyx,
  OPAL: prisma.GroupRole.opal,
  ORACLE: prisma.GroupRole.oracle,
  ORANGE: prisma.GroupRole.orange,
  OWNER: prisma.GroupRole.owner,
  PAGE: prisma.GroupRole.page,
  PALADIN: prisma.GroupRole.paladin,
  PAWN: prisma.GroupRole.pawn,
  PILGRIM: prisma.GroupRole.pilgrim,
  PINE: prisma.GroupRole.pine,
  PINK: prisma.GroupRole.pink,
  PREFECT: prisma.GroupRole.prefect,
  PRIEST: prisma.GroupRole.priest,
  PRIVATE: prisma.GroupRole.private,
  PRODIGY: prisma.GroupRole.prodigy,
  PROSELYTE: prisma.GroupRole.proselyte,
  PROSPECTOR: prisma.GroupRole.prospector,
  PROTECTOR: prisma.GroupRole.protector,
  PURE: prisma.GroupRole.pure,
  PURPLE: prisma.GroupRole.purple,
  PYROMANCER: prisma.GroupRole.pyromancer,
  QUESTER: prisma.GroupRole.quester,
  RACER: prisma.GroupRole.racer,
  RAIDER: prisma.GroupRole.raider,
  RANGER: prisma.GroupRole.ranger,
  RECORD_CHASER: prisma.GroupRole.record_chaser,
  RECRUIT: prisma.GroupRole.recruit,
  RECRUITER: prisma.GroupRole.recruiter,
  RED_TOPAZ: prisma.GroupRole.red_topaz,
  RED: prisma.GroupRole.red,
  ROGUE: prisma.GroupRole.rogue,
  RUBY: prisma.GroupRole.ruby,
  RUNE: prisma.GroupRole.rune,
  RUNECRAFTER: prisma.GroupRole.runecrafter,
  SAGE: prisma.GroupRole.sage,
  SAPPHIRE: prisma.GroupRole.sapphire,
  SARADOMINIST: prisma.GroupRole.saradominist,
  SAVIOUR: prisma.GroupRole.saviour,
  SCAVENGER: prisma.GroupRole.scavenger,
  SCHOLAR: prisma.GroupRole.scholar,
  SCOURGE: prisma.GroupRole.scourge,
  SCOUT: prisma.GroupRole.scout,
  SCRIBE: prisma.GroupRole.scribe,
  SEER: prisma.GroupRole.seer,
  SENATOR: prisma.GroupRole.senator,
  SENTRY: prisma.GroupRole.sentry,
  SERENIST: prisma.GroupRole.serenist,
  SERGEANT: prisma.GroupRole.sergeant,
  SHAMAN: prisma.GroupRole.shaman,
  SHERIFF: prisma.GroupRole.sheriff,
  SHORT_GREEN_GUY: prisma.GroupRole.short_green_guy,
  SKILLER: prisma.GroupRole.skiller,
  SKULLED: prisma.GroupRole.skulled,
  SLAYER: prisma.GroupRole.slayer,
  SMITER: prisma.GroupRole.smiter,
  SMITH: prisma.GroupRole.smith,
  SMUGGLER: prisma.GroupRole.smuggler,
  SNIPER: prisma.GroupRole.sniper,
  SOUL: prisma.GroupRole.soul,
  SPECIALIST: prisma.GroupRole.specialist,
  SPEED_RUNNER: prisma.GroupRole.speed_runner,
  SPELLCASTER: prisma.GroupRole.spellcaster,
  SQUIRE: prisma.GroupRole.squire,
  STAFF: prisma.GroupRole.staff,
  STEEL: prisma.GroupRole.steel,
  STRIDER: prisma.GroupRole.strider,
  STRIKER: prisma.GroupRole.striker,
  SUMMONER: prisma.GroupRole.summoner,
  SUPERIOR: prisma.GroupRole.superior,
  SUPERVISOR: prisma.GroupRole.supervisor,
  TEACHER: prisma.GroupRole.teacher,
  TEMPLAR: prisma.GroupRole.templar,
  THERAPIST: prisma.GroupRole.therapist,
  THIEF: prisma.GroupRole.thief,
  TIRANNIAN: prisma.GroupRole.tirannian,
  TRIALIST: prisma.GroupRole.trialist,
  TRICKSTER: prisma.GroupRole.trickster,
  TZKAL: prisma.GroupRole.tzkal,
  TZTOK: prisma.GroupRole.tztok,
  UNHOLY: prisma.GroupRole.unholy,
  VAGRANT: prisma.GroupRole.vagrant,
  VANGUARD: prisma.GroupRole.vanguard,
  WALKER: prisma.GroupRole.walker,
  WANDERER: prisma.GroupRole.wanderer,
  WARDEN: prisma.GroupRole.warden,
  WARLOCK: prisma.GroupRole.warlock,
  WARRIOR: prisma.GroupRole.warrior,
  WATER: prisma.GroupRole.water,
  WILD: prisma.GroupRole.wild,
  WILLOW: prisma.GroupRole.willow,
  WILY: prisma.GroupRole.wily,
  WINTUMBER: prisma.GroupRole.wintumber,
  WITCH: prisma.GroupRole.witch,
  WIZARD: prisma.GroupRole.wizard,
  WORKER: prisma.GroupRole.worker,
  WRATH: prisma.GroupRole.wrath,
  XERICIAN: prisma.GroupRole.xerician,
  YELLOW: prisma.GroupRole.yellow,
  YEW: prisma.GroupRole.yew,
  ZAMORAKIAN: prisma.GroupRole.zamorakian,
  ZAROSIAN: prisma.GroupRole.zarosian,
  ZEALOT: prisma.GroupRole.zealot,
  ZENYTE: prisma.GroupRole.zenyte
} as const;

export type GroupRole = typeof GroupRole[keyof typeof GroupRole];

export const Country = prisma.Country;

export type Country = typeof Country[keyof typeof Country];
