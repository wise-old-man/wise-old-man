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

export const NameChangeStatus = {
  PENDING: 'pending',
  DENIED: 'denied',
  APPROVED: 'approved'
} as const;

export type NameChangeStatus = (typeof NameChangeStatus)[keyof typeof NameChangeStatus];

export const PlayerType = {
  UNKNOWN: 'unknown',
  REGULAR: 'regular',
  IRONMAN: 'ironman',
  HARDCORE: 'hardcore',
  ULTIMATE: 'ultimate'
} as const;

export type PlayerType = (typeof PlayerType)[keyof typeof PlayerType];

export const PlayerAnnotationType = {
  OPT_OUT: 'opt_out',
  OPT_OUT_GROUPS: 'opt_out_groups',
  OPT_OUT_COMPETITIONS: 'opt_out_competitions',
  BLOCKED: 'blocked',
  FAKE_F2P: 'fake_f2p'
} as const;

export type PlayerAnnotationType = (typeof PlayerAnnotationType)[keyof typeof PlayerAnnotationType];

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
  GB_NIR: 'GB_NIR',
  GB_SCT: 'GB_SCT',
  GB_WLS: 'GB_WLS',
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
