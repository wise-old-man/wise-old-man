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
  OVERALL: 'overall',
  ATTACK: 'attack',
  DEFENCE: 'defence',
  STRENGTH: 'strength',
  HITPOINTS: 'hitpoints',
  RANGED: 'ranged',
  PRAYER: 'prayer',
  MAGIC: 'magic',
  COOKING: 'cooking',
  WOODCUTTING: 'woodcutting',
  FLETCHING: 'fletching',
  FISHING: 'fishing',
  FIREMAKING: 'firemaking',
  CRAFTING: 'crafting',
  SMITHING: 'smithing',
  MINING: 'mining',
  HERBLORE: 'herblore',
  AGILITY: 'agility',
  THIEVING: 'thieving',
  SLAYER: 'slayer',
  FARMING: 'farming',
  RUNECRAFTING: 'runecrafting',
  HUNTER: 'hunter',
  CONSTRUCTION: 'construction'
} as const;

export const Activity = {
  LEAGUE_POINTS: 'league_points',
  BOUNTY_HUNTER_HUNTER: 'bounty_hunter_hunter',
  BOUNTY_HUNTER_ROGUE: 'bounty_hunter_rogue',
  CLUE_SCROLLS_ALL: 'clue_scrolls_all',
  CLUE_SCROLLS_BEGINNER: 'clue_scrolls_beginner',
  CLUE_SCROLLS_EASY: 'clue_scrolls_easy',
  CLUE_SCROLLS_MEDIUM: 'clue_scrolls_medium',
  CLUE_SCROLLS_HARD: 'clue_scrolls_hard',
  CLUE_SCROLLS_ELITE: 'clue_scrolls_elite',
  CLUE_SCROLLS_MASTER: 'clue_scrolls_master',
  LAST_MAN_STANDING: 'last_man_standing',
  PVP_ARENA: 'pvp_arena',
  SOUL_WARS_ZEAL: 'soul_wars_zeal',
  GUARDIANS_OF_THE_RIFT: 'guardians_of_the_rift',
  COLOSSEUM_GLORY: 'colosseum_glory',
  COLLECTIONS_LOGGED: 'collections_logged'
} as const;

export const Boss = {
  ABYSSAL_SIRE: 'abyssal_sire',
  ALCHEMICAL_HYDRA: 'alchemical_hydra',
  AMOXLIATL: 'amoxliatl',
  ARAXXOR: 'araxxor',
  ARTIO: 'artio',
  BARROWS_CHESTS: 'barrows_chests',
  BRYOPHYTA: 'bryophyta',
  CALLISTO: 'callisto',
  CALVARION: 'calvarion',
  CERBERUS: 'cerberus',
  CHAMBERS_OF_XERIC: 'chambers_of_xeric',
  CHAMBERS_OF_XERIC_CM: 'chambers_of_xeric_challenge_mode',
  CHAOS_ELEMENTAL: 'chaos_elemental',
  CHAOS_FANATIC: 'chaos_fanatic',
  COMMANDER_ZILYANA: 'commander_zilyana',
  CORPOREAL_BEAST: 'corporeal_beast',
  CRAZY_ARCHAEOLOGIST: 'crazy_archaeologist',
  DAGANNOTH_PRIME: 'dagannoth_prime',
  DAGANNOTH_REX: 'dagannoth_rex',
  DAGANNOTH_SUPREME: 'dagannoth_supreme',
  DERANGED_ARCHAEOLOGIST: 'deranged_archaeologist',
  DUKE_SUCELLUS: 'duke_sucellus',
  GENERAL_GRAARDOR: 'general_graardor',
  GIANT_MOLE: 'giant_mole',
  GROTESQUE_GUARDIANS: 'grotesque_guardians',
  HESPORI: 'hespori',
  KALPHITE_QUEEN: 'kalphite_queen',
  KING_BLACK_DRAGON: 'king_black_dragon',
  KRAKEN: 'kraken',
  KREEARRA: 'kreearra',
  KRIL_TSUTSAROTH: 'kril_tsutsaroth',
  LUNAR_CHESTS: 'lunar_chests',
  MIMIC: 'mimic',
  NEX: 'nex',
  NIGHTMARE: 'nightmare',
  PHOSANIS_NIGHTMARE: 'phosanis_nightmare',
  OBOR: 'obor',
  PHANTOM_MUSPAH: 'phantom_muspah',
  SARACHNIS: 'sarachnis',
  SCORPIA: 'scorpia',
  SCURRIUS: 'scurrius',
  SKOTIZO: 'skotizo',
  SOL_HEREDIT: 'sol_heredit',
  SPINDEL: 'spindel',
  TEMPOROSS: 'tempoross',
  THE_GAUNTLET: 'the_gauntlet',
  THE_CORRUPTED_GAUNTLET: 'the_corrupted_gauntlet',
  THE_HUEYCOATL: 'the_hueycoatl',
  THE_LEVIATHAN: 'the_leviathan',
  THE_ROYAL_TITANS: 'the_royal_titans',
  THE_WHISPERER: 'the_whisperer',
  THEATRE_OF_BLOOD: 'theatre_of_blood',
  THEATRE_OF_BLOOD_HARD_MODE: 'theatre_of_blood_hard_mode',
  THERMONUCLEAR_SMOKE_DEVIL: 'thermonuclear_smoke_devil',
  TOMBS_OF_AMASCUT: 'tombs_of_amascut',
  TOMBS_OF_AMASCUT_EXPERT: 'tombs_of_amascut_expert',
  TZKAL_ZUK: 'tzkal_zuk',
  TZTOK_JAD: 'tztok_jad',
  VARDORVIS: 'vardorvis',
  VENENATIS: 'venenatis',
  VETION: 'vetion',
  VORKATH: 'vorkath',
  WINTERTODT: 'wintertodt',
  YAMA: 'yama',
  ZALCANO: 'zalcano',
  ZULRAH: 'zulrah'
} as const;

export const ComputedMetric = {
  EHP: 'ehp',
  EHB: 'ehb'
} as const;

export const Metric = {
  ...Skill,
  ...Activity,
  ...Boss,
  ...ComputedMetric
} as const;

export type Skill = (typeof Skill)[keyof typeof Skill];
export type Activity = (typeof Activity)[keyof typeof Activity];
export type Boss = (typeof Boss)[keyof typeof Boss];
export type ComputedMetric = (typeof ComputedMetric)[keyof typeof ComputedMetric];
export type Metric = (typeof Metric)[keyof typeof Metric];

export const ActivityType = {
  JOINED: 'joined',
  LEFT: 'left',
  CHANGED_ROLE: 'changed_role'
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];
