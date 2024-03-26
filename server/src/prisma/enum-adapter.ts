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
  COLOSSEUM_GLORY: 'colosseum_glory'
} as const;

export const Boss = {
  ABYSSAL_SIRE: 'abyssal_sire',
  ALCHEMICAL_HYDRA: 'alchemical_hydra',
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
  THE_LEVIATHAN: 'the_leviathan',
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

export const NameChangeStatus = {
  PENDING: 'pending',
  DENIED: 'denied',
  APPROVED: 'approved'
} as const;

export type NameChangeStatus = (typeof NameChangeStatus)[keyof typeof NameChangeStatus];

export const Period = {
  FIVE_MIN: 'five_min',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
} as const;

export type Period = (typeof Period)[keyof typeof Period];

export const PlayerType = {
  UNKNOWN: 'unknown',
  REGULAR: 'regular',
  IRONMAN: 'ironman',
  HARDCORE: 'hardcore',
  ULTIMATE: 'ultimate'
} as const;

export type PlayerType = (typeof PlayerType)[keyof typeof PlayerType];

export const PlayerBuild = {
  MAIN: 'main',
  F2P: 'f2p',
  F2P_LVL3: 'f2p_lvl3',
  LVL3: 'lvl3',
  ZERKER: 'zerker',
  DEF1: 'def1',
  HP10: 'hp10'
} as const;

export type PlayerBuild = (typeof PlayerBuild)[keyof typeof PlayerBuild];

export const PlayerStatus = {
  ACTIVE: 'active',
  UNRANKED: 'unranked',
  FLAGGED: 'flagged',
  ARCHIVED: 'archived',
  BANNED: 'banned'
} as const;

export type PlayerStatus = (typeof PlayerStatus)[keyof typeof PlayerStatus];

export const CompetitionType = {
  CLASSIC: 'classic',
  TEAM: 'team'
} as const;

export type CompetitionType = (typeof CompetitionType)[keyof typeof CompetitionType];

export const GroupRole = {
  ACHIEVER: 'achiever',
  ADAMANT: 'adamant',
  ADEPT: 'adept',
  ADMINISTRATOR: 'administrator',
  ADMIRAL: 'admiral',
  ADVENTURER: 'adventurer',
  AIR: 'air',
  ANCHOR: 'anchor',
  APOTHECARY: 'apothecary',
  ARCHER: 'archer',
  ARMADYLEAN: 'armadylean',
  ARTILLERY: 'artillery',
  ARTISAN: 'artisan',
  ASGARNIAN: 'asgarnian',
  ASSASSIN: 'assassin',
  ASSISTANT: 'assistant',
  ASTRAL: 'astral',
  ATHLETE: 'athlete',
  ATTACKER: 'attacker',
  BANDIT: 'bandit',
  BANDOSIAN: 'bandosian',
  BARBARIAN: 'barbarian',
  BATTLEMAGE: 'battlemage',
  BEAST: 'beast',
  BERSERKER: 'berserker',
  BLISTERWOOD: 'blisterwood',
  BLOOD: 'blood',
  BLUE: 'blue',
  BOB: 'bob',
  BODY: 'body',
  BRASSICAN: 'brassican',
  BRAWLER: 'brawler',
  BRIGADIER: 'brigadier',
  BRIGAND: 'brigand',
  BRONZE: 'bronze',
  BRUISER: 'bruiser',
  BULWARK: 'bulwark',
  BURGLAR: 'burglar',
  BURNT: 'burnt',
  CADET: 'cadet',
  CAPTAIN: 'captain',
  CARRY: 'carry',
  CHAMPION: 'champion',
  CHAOS: 'chaos',
  CLERIC: 'cleric',
  COLLECTOR: 'collector',
  COLONEL: 'colonel',
  COMMANDER: 'commander',
  COMPETITOR: 'competitor',
  COMPLETIONIST: 'completionist',
  CONSTRUCTOR: 'constructor',
  COOK: 'cook',
  COORDINATOR: 'coordinator',
  CORPORAL: 'corporal',
  COSMIC: 'cosmic',
  COUNCILLOR: 'councillor',
  CRAFTER: 'crafter',
  CREW: 'crew',
  CRUSADER: 'crusader',
  CUTPURSE: 'cutpurse',
  DEATH: 'death',
  DEFENDER: 'defender',
  DEFILER: 'defiler',
  DEPUTY_OWNER: 'deputy_owner',
  DESTROYER: 'destroyer',
  DIAMOND: 'diamond',
  DISEASED: 'diseased',
  DOCTOR: 'doctor',
  DOGSBODY: 'dogsbody',
  DRAGON: 'dragon',
  DRAGONSTONE: 'dragonstone',
  DRUID: 'druid',
  DUELLIST: 'duellist',
  EARTH: 'earth',
  ELITE: 'elite',
  EMERALD: 'emerald',
  ENFORCER: 'enforcer',
  EPIC: 'epic',
  EXECUTIVE: 'executive',
  EXPERT: 'expert',
  EXPLORER: 'explorer',
  FARMER: 'farmer',
  FEEDER: 'feeder',
  FIGHTER: 'fighter',
  FIRE: 'fire',
  FIREMAKER: 'firemaker',
  FIRESTARTER: 'firestarter',
  FISHER: 'fisher',
  FLETCHER: 'fletcher',
  FORAGER: 'forager',
  FREMENNIK: 'fremennik',
  GAMER: 'gamer',
  GATHERER: 'gatherer',
  GENERAL: 'general',
  GNOME_CHILD: 'gnome_child',
  GNOME_ELDER: 'gnome_elder',
  GOBLIN: 'goblin',
  GOLD: 'gold',
  GOON: 'goon',
  GREEN: 'green',
  GREY: 'grey',
  GUARDIAN: 'guardian',
  GUTHIXIAN: 'guthixian',
  HARPOON: 'harpoon',
  HEALER: 'healer',
  HELLCAT: 'hellcat',
  HELPER: 'helper',
  HERBOLOGIST: 'herbologist',
  HERO: 'hero',
  HOLY: 'holy',
  HOARDER: 'hoarder',
  HUNTER: 'hunter',
  IGNITOR: 'ignitor',
  ILLUSIONIST: 'illusionist',
  IMP: 'imp',
  INFANTRY: 'infantry',
  INQUISITOR: 'inquisitor',
  IRON: 'iron',
  JADE: 'jade',
  JUSTICIAR: 'justiciar',
  KANDARIN: 'kandarin',
  KARAMJAN: 'karamjan',
  KHARIDIAN: 'kharidian',
  KITTEN: 'kitten',
  KNIGHT: 'knight',
  LABOURER: 'labourer',
  LAW: 'law',
  LEADER: 'leader',
  LEARNER: 'learner',
  LEGACY: 'legacy',
  LEGEND: 'legend',
  LEGIONNAIRE: 'legionnaire',
  LIEUTENANT: 'lieutenant',
  LOOTER: 'looter',
  LUMBERJACK: 'lumberjack',
  MAGIC: 'magic',
  MAGICIAN: 'magician',
  MAJOR: 'major',
  MAPLE: 'maple',
  MARSHAL: 'marshal',
  MASTER: 'master',
  MAXED: 'maxed',
  MEDIATOR: 'mediator',
  MEDIC: 'medic',
  MENTOR: 'mentor',
  MEMBER: 'member',
  MERCHANT: 'merchant',
  MIND: 'mind',
  MINER: 'miner',
  MINION: 'minion',
  MISTHALINIAN: 'misthalinian',
  MITHRIL: 'mithril',
  MODERATOR: 'moderator',
  MONARCH: 'monarch',
  MORYTANIAN: 'morytanian',
  MYSTIC: 'mystic',
  MYTH: 'myth',
  NATURAL: 'natural',
  NATURE: 'nature',
  NECROMANCER: 'necromancer',
  NINJA: 'ninja',
  NOBLE: 'noble',
  NOVICE: 'novice',
  NURSE: 'nurse',
  OAK: 'oak',
  OFFICER: 'officer',
  ONYX: 'onyx',
  OPAL: 'opal',
  ORACLE: 'oracle',
  ORANGE: 'orange',
  OWNER: 'owner',
  PAGE: 'page',
  PALADIN: 'paladin',
  PAWN: 'pawn',
  PILGRIM: 'pilgrim',
  PINE: 'pine',
  PINK: 'pink',
  PREFECT: 'prefect',
  PRIEST: 'priest',
  PRIVATE: 'private',
  PRODIGY: 'prodigy',
  PROSELYTE: 'proselyte',
  PROSPECTOR: 'prospector',
  PROTECTOR: 'protector',
  PURE: 'pure',
  PURPLE: 'purple',
  PYROMANCER: 'pyromancer',
  QUESTER: 'quester',
  RACER: 'racer',
  RAIDER: 'raider',
  RANGER: 'ranger',
  RECORD_CHASER: 'record_chaser',
  RECRUIT: 'recruit',
  RECRUITER: 'recruiter',
  RED_TOPAZ: 'red_topaz',
  RED: 'red',
  ROGUE: 'rogue',
  RUBY: 'ruby',
  RUNE: 'rune',
  RUNECRAFTER: 'runecrafter',
  SAGE: 'sage',
  SAPPHIRE: 'sapphire',
  SARADOMINIST: 'saradominist',
  SAVIOUR: 'saviour',
  SCAVENGER: 'scavenger',
  SCHOLAR: 'scholar',
  SCOURGE: 'scourge',
  SCOUT: 'scout',
  SCRIBE: 'scribe',
  SEER: 'seer',
  SENATOR: 'senator',
  SENTRY: 'sentry',
  SERENIST: 'serenist',
  SERGEANT: 'sergeant',
  SHAMAN: 'shaman',
  SHERIFF: 'sheriff',
  SHORT_GREEN_GUY: 'short_green_guy',
  SKILLER: 'skiller',
  SKULLED: 'skulled',
  SLAYER: 'slayer',
  SMITER: 'smiter',
  SMITH: 'smith',
  SMUGGLER: 'smuggler',
  SNIPER: 'sniper',
  SOUL: 'soul',
  SPECIALIST: 'specialist',
  SPEED_RUNNER: 'speed_runner',
  SPELLCASTER: 'spellcaster',
  SQUIRE: 'squire',
  STAFF: 'staff',
  STEEL: 'steel',
  STRIDER: 'strider',
  STRIKER: 'striker',
  SUMMONER: 'summoner',
  SUPERIOR: 'superior',
  SUPERVISOR: 'supervisor',
  TEACHER: 'teacher',
  TEMPLAR: 'templar',
  THERAPIST: 'therapist',
  THIEF: 'thief',
  TIRANNIAN: 'tirannian',
  TRIALIST: 'trialist',
  TRICKSTER: 'trickster',
  TZKAL: 'tzkal',
  TZTOK: 'tztok',
  UNHOLY: 'unholy',
  VAGRANT: 'vagrant',
  VANGUARD: 'vanguard',
  WALKER: 'walker',
  WANDERER: 'wanderer',
  WARDEN: 'warden',
  WARLOCK: 'warlock',
  WARRIOR: 'warrior',
  WATER: 'water',
  WILD: 'wild',
  WILLOW: 'willow',
  WILY: 'wily',
  WINTUMBER: 'wintumber',
  WITCH: 'witch',
  WIZARD: 'wizard',
  WORKER: 'worker',
  WRATH: 'wrath',
  XERICIAN: 'xerician',
  YELLOW: 'yellow',
  YEW: 'yew',
  ZAMORAKIAN: 'zamorakian',
  ZAROSIAN: 'zarosian',
  ZEALOT: 'zealot',
  ZENYTE: 'zenyte'
} as const;

export type GroupRole = (typeof GroupRole)[keyof typeof GroupRole];

export const Country = {
  AD: 'AD',
  AE: 'AE',
  AF: 'AF',
  AG: 'AG',
  AI: 'AI',
  AL: 'AL',
  AM: 'AM',
  AO: 'AO',
  AQ: 'AQ',
  AR: 'AR',
  AS: 'AS',
  AT: 'AT',
  AU: 'AU',
  AW: 'AW',
  AX: 'AX',
  AZ: 'AZ',
  BA: 'BA',
  BB: 'BB',
  BD: 'BD',
  BE: 'BE',
  BF: 'BF',
  BG: 'BG',
  BH: 'BH',
  BI: 'BI',
  BJ: 'BJ',
  BL: 'BL',
  BM: 'BM',
  BN: 'BN',
  BO: 'BO',
  BQ: 'BQ',
  BR: 'BR',
  BS: 'BS',
  BT: 'BT',
  BV: 'BV',
  BW: 'BW',
  BY: 'BY',
  BZ: 'BZ',
  CA: 'CA',
  CC: 'CC',
  CD: 'CD',
  CF: 'CF',
  CG: 'CG',
  CH: 'CH',
  CI: 'CI',
  CK: 'CK',
  CL: 'CL',
  CM: 'CM',
  CN: 'CN',
  CO: 'CO',
  CR: 'CR',
  CU: 'CU',
  CV: 'CV',
  CW: 'CW',
  CX: 'CX',
  CY: 'CY',
  CZ: 'CZ',
  DE: 'DE',
  DJ: 'DJ',
  DK: 'DK',
  DM: 'DM',
  DO: 'DO',
  DZ: 'DZ',
  EC: 'EC',
  EE: 'EE',
  EG: 'EG',
  EH: 'EH',
  ER: 'ER',
  ES: 'ES',
  ET: 'ET',
  FI: 'FI',
  FJ: 'FJ',
  FK: 'FK',
  FM: 'FM',
  FO: 'FO',
  FR: 'FR',
  GA: 'GA',
  GB: 'GB',
  GB_NIR: 'GB-NIR',
  GB_SCT: 'GB-SCT',
  GB_WLS: 'GB-WLS',
  GD: 'GD',
  GE: 'GE',
  GF: 'GF',
  GG: 'GG',
  GH: 'GH',
  GI: 'GI',
  GL: 'GL',
  GM: 'GM',
  GN: 'GN',
  GP: 'GP',
  GQ: 'GQ',
  GR: 'GR',
  GS: 'GS',
  GT: 'GT',
  GU: 'GU',
  GW: 'GW',
  GY: 'GY',
  HK: 'HK',
  HM: 'HM',
  HN: 'HN',
  HR: 'HR',
  HT: 'HT',
  HU: 'HU',
  ID: 'ID',
  IE: 'IE',
  IL: 'IL',
  IM: 'IM',
  IN: 'IN',
  IO: 'IO',
  IQ: 'IQ',
  IR: 'IR',
  IS: 'IS',
  IT: 'IT',
  JE: 'JE',
  JM: 'JM',
  JO: 'JO',
  JP: 'JP',
  KE: 'KE',
  KG: 'KG',
  KH: 'KH',
  KI: 'KI',
  KM: 'KM',
  KN: 'KN',
  KP: 'KP',
  KR: 'KR',
  KW: 'KW',
  KY: 'KY',
  KZ: 'KZ',
  LA: 'LA',
  LB: 'LB',
  LC: 'LC',
  LI: 'LI',
  LK: 'LK',
  LR: 'LR',
  LS: 'LS',
  LT: 'LT',
  LU: 'LU',
  LV: 'LV',
  LY: 'LY',
  MA: 'MA',
  MC: 'MC',
  MD: 'MD',
  ME: 'ME',
  MF: 'MF',
  MG: 'MG',
  MH: 'MH',
  MK: 'MK',
  ML: 'ML',
  MM: 'MM',
  MN: 'MN',
  MO: 'MO',
  MP: 'MP',
  MQ: 'MQ',
  MR: 'MR',
  MS: 'MS',
  MT: 'MT',
  MU: 'MU',
  MV: 'MV',
  MW: 'MW',
  MX: 'MX',
  MY: 'MY',
  MZ: 'MZ',
  NA: 'NA',
  NC: 'NC',
  NE: 'NE',
  NF: 'NF',
  NG: 'NG',
  NI: 'NI',
  NL: 'NL',
  NO: 'NO',
  NP: 'NP',
  NR: 'NR',
  NU: 'NU',
  NZ: 'NZ',
  OM: 'OM',
  PA: 'PA',
  PE: 'PE',
  PF: 'PF',
  PG: 'PG',
  PH: 'PH',
  PK: 'PK',
  PL: 'PL',
  PM: 'PM',
  PN: 'PN',
  PR: 'PR',
  PS: 'PS',
  PT: 'PT',
  PW: 'PW',
  PY: 'PY',
  QA: 'QA',
  RE: 'RE',
  RO: 'RO',
  RS: 'RS',
  RU: 'RU',
  RW: 'RW',
  SA: 'SA',
  SB: 'SB',
  SC: 'SC',
  SD: 'SD',
  SE: 'SE',
  SG: 'SG',
  SH: 'SH',
  SI: 'SI',
  SJ: 'SJ',
  SK: 'SK',
  SL: 'SL',
  SM: 'SM',
  SN: 'SN',
  SO: 'SO',
  SR: 'SR',
  SS: 'SS',
  ST: 'ST',
  SV: 'SV',
  SX: 'SX',
  SY: 'SY',
  SZ: 'SZ',
  TC: 'TC',
  TD: 'TD',
  TF: 'TF',
  TG: 'TG',
  TH: 'TH',
  TJ: 'TJ',
  TK: 'TK',
  TL: 'TL',
  TM: 'TM',
  TN: 'TN',
  TO: 'TO',
  TR: 'TR',
  TT: 'TT',
  TV: 'TV',
  TW: 'TW',
  TZ: 'TZ',
  UA: 'UA',
  UG: 'UG',
  UM: 'UM',
  US: 'US',
  UY: 'UY',
  UZ: 'UZ',
  VA: 'VA',
  VC: 'VC',
  VE: 'VE',
  VG: 'VG',
  VI: 'VI',
  VN: 'VN',
  VU: 'VU',
  WF: 'WF',
  WS: 'WS',
  YE: 'YE',
  YT: 'YT',
  ZA: 'ZA',
  ZM: 'ZM',
  ZW: 'ZW'
} as const;

export type Country = (typeof Country)[keyof typeof Country];

export const ActivityType = {
  JOINED: 'joined',
  LEFT: 'left',
  CHANGED_ROLE: 'changed_role'
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];
