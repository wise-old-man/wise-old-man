import { mapValues, capitalize } from 'lodash';

enum Skill {
  OVERALL = 'overall',
  ATTACK = 'attack',
  DEFENCE = 'defence',
  STRENGTH = 'strength',
  HITPOINTS = 'hitpoints',
  RANGED = 'ranged',
  PRAYER = 'prayer',
  MAGIC = 'magic',
  COOKING = 'cooking',
  WOODCUTTING = 'woodcutting',
  FLETCHING = 'fletching',
  FISHING = 'fishing',
  FIREMAKING = 'firemaking',
  CRAFTING = 'crafting',
  SMITHING = 'smithing',
  MINING = 'mining',
  HERBLORE = 'herblore',
  AGILITY = 'agility',
  THIEVING = 'thieving',
  SLAYER = 'slayer',
  FARMING = 'farming',
  RUNECRAFTING = 'runecrafting',
  HUNTER = 'hunter',
  CONSTRUCTION = 'construction'
}

enum Boss {
  ABYSSAL_SIRE = 'abyssal_sire',
  ALCHEMICAL_HYDRA = 'alchemical_hydra',
  BARROWS_CHESTS = 'barrows_chests',
  BRYOPHYTA = 'bryophyta',
  CALLISTO = 'callisto',
  CERBERUS = 'cerberus',
  CHAMBERS_OF_XERIC = 'chambers_of_xeric',
  CHAMBERS_OF_XERIC_CM = 'chambers_of_xeric_challenge_mode',
  CHAOS_ELEMENTAL = 'chaos_elemental',
  CHAOS_FANATIC = 'chaos_fanatic',
  COMMANDER_ZILYANA = 'commander_zilyana',
  CORPOREAL_BEAST = 'corporeal_beast',
  CRAZY_ARCHAEOLOGIST = 'crazy_archaeologist',
  DAGANNOTH_PRIME = 'dagannoth_prime',
  DAGANNOTH_REX = 'dagannoth_rex',
  DAGANNOTH_SUPREME = 'dagannoth_supreme',
  DERANGED_ARCHAEOLOGIST = 'deranged_archaeologist',
  GENERAL_GRAARDOR = 'general_graardor',
  GIANT_MOLE = 'giant_mole',
  GROTESQUE_GUARDIANS = 'grotesque_guardians',
  HESPORI = 'hespori',
  KALPHITE_QUEEN = 'kalphite_queen',
  KING_BLACK_DRAGON = 'king_black_dragon',
  KRAKEN = 'kraken',
  KREEARRA = 'kreearra',
  KRIL_TSUTSAROTH = 'kril_tsutsaroth',
  MIMIC = 'mimic',
  NEX = 'nex',
  NIGHTMARE = 'nightmare',
  PHOSANIS_NIGHTMARE = 'phosanis_nightmare',
  OBOR = 'obor',
  SARACHNIS = 'sarachnis',
  SCORPIA = 'scorpia',
  SKOTIZO = 'skotizo',
  TEMPOROSS = 'tempoross',
  THE_GAUNTLET = 'the_gauntlet',
  THE_CORRUPTED_GAUNTLET = 'the_corrupted_gauntlet',
  THEATRE_OF_BLOOD = 'theatre_of_blood',
  THEATRE_OF_BLOOD_HARD_MODE = 'theatre_of_blood_hard_mode',
  THERMONUCLEAR_SMOKE_DEVIL = 'thermonuclear_smoke_devil',
  TOMBS_OF_AMASCUT = 'tombs_of_amascut',
  TOMBS_OF_AMASCUT_EXPERT = 'tombs_of_amascut_expert',
  TZKAL_ZUK = 'tzkal_zuk',
  TZTOK_JAD = 'tztok_jad',
  VENENATIS = 'venenatis',
  VETION = 'vetion',
  VORKATH = 'vorkath',
  WINTERTODT = 'wintertodt',
  ZALCANO = 'zalcano',
  ZULRAH = 'zulrah'
}

enum Activity {
  LEAGUE_POINTS = 'league_points',
  BOUNTY_HUNTER_HUNTER = 'bounty_hunter_hunter',
  BOUNTY_HUNTER_ROGUE = 'bounty_hunter_rogue',
  CLUE_SCROLLS_ALL = 'clue_scrolls_all',
  CLUE_SCROLLS_BEGINNER = 'clue_scrolls_beginner',
  CLUE_SCROLLS_EASY = 'clue_scrolls_easy',
  CLUE_SCROLLS_MEDIUM = 'clue_scrolls_medium',
  CLUE_SCROLLS_HARD = 'clue_scrolls_hard',
  CLUE_SCROLLS_ELITE = 'clue_scrolls_elite',
  CLUE_SCROLLS_MASTER = 'clue_scrolls_master',
  LAST_MAN_STANDING = 'last_man_standing',
  PVP_ARENA = 'pvp_arena',
  SOUL_WARS_ZEAL = 'soul_wars_zeal',
  GUARDIANS_OF_THE_RIFT = 'guardians_of_the_rift'
}

enum VirtualMetric {
  EHP = 'ehp',
  EHB = 'ehb'
}

enum MetricType {
  SKILL = 'skill',
  BOSS = 'boss',
  ACTIVITY = 'activity',
  VIRTUAL = 'virtual'
}

enum MetricMeasure {
  EXPERIENCE = 'experience',
  KILLS = 'kills',
  SCORE = 'score',
  VALUE = 'value'
}

const SkillProps = mapValues(
  {
    [Skill.OVERALL]: { name: 'Overall', isCombat: false, isMembers: false },
    [Skill.ATTACK]: { name: 'Attack', isCombat: true, isMembers: false },
    [Skill.DEFENCE]: { name: 'Defence', isCombat: true, isMembers: false },
    [Skill.STRENGTH]: { name: 'Strength', isCombat: true, isMembers: false },
    [Skill.HITPOINTS]: { name: 'Hitpoints', isCombat: true, isMembers: false },
    [Skill.RANGED]: { name: 'Ranged', isCombat: true, isMembers: false },
    [Skill.PRAYER]: { name: 'Prayer', isCombat: true, isMembers: false },
    [Skill.MAGIC]: { name: 'Magic', isCombat: true, isMembers: false },
    [Skill.COOKING]: { name: 'Cooking', isCombat: false, isMembers: false },
    [Skill.WOODCUTTING]: { name: 'Woodcutting', isCombat: false, isMembers: false },
    [Skill.FLETCHING]: { name: 'Fletching', isCombat: false, isMembers: true },
    [Skill.FISHING]: { name: 'Fishing', isCombat: false, isMembers: false },
    [Skill.FIREMAKING]: { name: 'Firemaking', isCombat: false, isMembers: false },
    [Skill.CRAFTING]: { name: 'Crafting', isCombat: false, isMembers: false },
    [Skill.SMITHING]: { name: 'Smithing', isCombat: false, isMembers: false },
    [Skill.MINING]: { name: 'Mining', isCombat: false, isMembers: false },
    [Skill.HERBLORE]: { name: 'Herblore', isCombat: false, isMembers: true },
    [Skill.AGILITY]: { name: 'Agility', isCombat: false, isMembers: true },
    [Skill.THIEVING]: { name: 'Thieving', isCombat: false, isMembers: true },
    [Skill.SLAYER]: { name: 'Slayer', isCombat: false, isMembers: true },
    [Skill.FARMING]: { name: 'Farming', isCombat: false, isMembers: true },
    [Skill.RUNECRAFTING]: { name: 'Runecrafting', isCombat: false, isMembers: false },
    [Skill.HUNTER]: { name: 'Hunter', isCombat: false, isMembers: true },
    [Skill.CONSTRUCTION]: { name: 'Construction', isCombat: false, isMembers: false }
  },
  (props, key) => ({ ...props, key, type: MetricType.SKILL, measure: MetricMeasure.EXPERIENCE })
);

const BossProps = mapValues(
  {
    [Boss.ABYSSAL_SIRE]: { name: 'Abyssal Sire', minimumKc: 50, isMembers: true },
    [Boss.ALCHEMICAL_HYDRA]: { name: 'Alchemical Hydra', minimumKc: 50, isMembers: true },
    [Boss.BARROWS_CHESTS]: { name: 'Barrows Chests', minimumKc: 50, isMembers: true },
    [Boss.BRYOPHYTA]: { name: 'Bryophyta', minimumKc: 5, isMembers: false },
    [Boss.CALLISTO]: { name: 'Callisto', minimumKc: 50, isMembers: true },
    [Boss.CERBERUS]: { name: 'Cerberus', minimumKc: 50, isMembers: true },
    [Boss.CHAMBERS_OF_XERIC]: { name: 'Chambers Of Xeric', minimumKc: 50, isMembers: true },
    [Boss.CHAMBERS_OF_XERIC_CM]: { name: 'Chambers Of Xeric (CM)', minimumKc: 5, isMembers: true },
    [Boss.CHAOS_ELEMENTAL]: { name: 'Chaos Elemental', minimumKc: 50, isMembers: true },
    [Boss.CHAOS_FANATIC]: { name: 'Chaos Fanatic', minimumKc: 50, isMembers: true },
    [Boss.COMMANDER_ZILYANA]: { name: 'Commander Zilyana', minimumKc: 50, isMembers: true },
    [Boss.CORPOREAL_BEAST]: { name: 'Corporeal Beast', minimumKc: 50, isMembers: true },
    [Boss.CRAZY_ARCHAEOLOGIST]: { name: 'Crazy Archaeologist', minimumKc: 50, isMembers: true },
    [Boss.DAGANNOTH_PRIME]: { name: 'Dagannoth Prime', minimumKc: 50, isMembers: true },
    [Boss.DAGANNOTH_REX]: { name: 'Dagannoth Rex', minimumKc: 50, isMembers: true },
    [Boss.DAGANNOTH_SUPREME]: { name: 'Dagannoth Supreme', minimumKc: 50, isMembers: true },
    [Boss.DERANGED_ARCHAEOLOGIST]: { name: 'Deranged Archaeologist', minimumKc: 50, isMembers: true },
    [Boss.GENERAL_GRAARDOR]: { name: 'General Graardor', minimumKc: 50, isMembers: true },
    [Boss.GIANT_MOLE]: { name: 'Giant Mole', minimumKc: 50, isMembers: true },
    [Boss.GROTESQUE_GUARDIANS]: { name: 'Grotesque Guardians', minimumKc: 50, isMembers: true },
    [Boss.HESPORI]: { name: 'Hespori', minimumKc: 5, isMembers: true },
    [Boss.KALPHITE_QUEEN]: { name: 'Kalphite Queen', minimumKc: 50, isMembers: true },
    [Boss.KING_BLACK_DRAGON]: { name: 'King Black Dragon', minimumKc: 50, isMembers: true },
    [Boss.KRAKEN]: { name: 'Kraken', minimumKc: 50, isMembers: true },
    [Boss.KREEARRA]: { name: "Kree'Arra", minimumKc: 50, isMembers: true },
    [Boss.KRIL_TSUTSAROTH]: { name: "K'ril Tsutsaroth", minimumKc: 50, isMembers: true },
    [Boss.MIMIC]: { name: 'Mimic', minimumKc: 1, isMembers: true },
    [Boss.NEX]: { name: 'Nex', minimumKc: 50, isMembers: true },
    [Boss.NIGHTMARE]: { name: 'Nightmare', minimumKc: 50, isMembers: true },
    [Boss.PHOSANIS_NIGHTMARE]: { name: "Phosani's Nightmare", minimumKc: 50, isMembers: true },
    [Boss.OBOR]: { name: 'Obor', minimumKc: 5, isMembers: false },
    [Boss.SARACHNIS]: { name: 'Sarachnis', minimumKc: 50, isMembers: true },
    [Boss.SKOTIZO]: { name: 'Skotizo', minimumKc: 5, isMembers: true },
    [Boss.SCORPIA]: { name: 'Scorpia', minimumKc: 50, isMembers: true },
    [Boss.TEMPOROSS]: { name: 'Tempoross', minimumKc: 50, isMembers: true },
    [Boss.THE_GAUNTLET]: { name: 'The Gauntlet', minimumKc: 50, isMembers: true },
    [Boss.THE_CORRUPTED_GAUNTLET]: { name: 'The Corrupted Gauntlet', minimumKc: 5, isMembers: true },
    [Boss.THEATRE_OF_BLOOD]: { name: 'Theatre Of Blood', minimumKc: 50, isMembers: true },
    [Boss.THEATRE_OF_BLOOD_HARD_MODE]: { name: 'Theatre Of Blood (HM)', minimumKc: 50, isMembers: true },
    [Boss.THERMONUCLEAR_SMOKE_DEVIL]: { name: 'Thermonuclear Smoke Devil', minimumKc: 50, isMembers: true },
    [Boss.TOMBS_OF_AMASCUT]: { name: 'Tombs of Amascut', minimumKc: 50, isMembers: true },
    [Boss.TOMBS_OF_AMASCUT_EXPERT]: { name: 'Tombs of Amascut (Expert Mode)', minimumKc: 50, isMembers: true},
    [Boss.TZKAL_ZUK]: { name: 'TzKal-Zuk', minimumKc: 1, isMembers: true },
    [Boss.TZTOK_JAD]: { name: 'TzTok-Jad', minimumKc: 5, isMembers: true },
    [Boss.VENENATIS]: { name: 'Venenatis', minimumKc: 50, isMembers: true },
    [Boss.VETION]: { name: "Vet'ion", minimumKc: 50, isMembers: true },
    [Boss.VORKATH]: { name: 'Vorkath', minimumKc: 50, isMembers: true },
    [Boss.WINTERTODT]: { name: 'Wintertodt', minimumKc: 50, isMembers: true },
    [Boss.ZALCANO]: { name: 'Zalcano', minimumKc: 50, isMembers: true },
    [Boss.ZULRAH]: { name: 'Zulrah', minimumKc: 50, isMembers: true }
  },
  (props, key) => ({ ...props, key, type: MetricType.BOSS, measure: MetricMeasure.KILLS })
);

const ActivityProps = mapValues(
  {
    [Activity.LEAGUE_POINTS]: { name: 'League Points' },
    [Activity.BOUNTY_HUNTER_HUNTER]: { name: 'Bounty Hunter (Hunter)' },
    [Activity.BOUNTY_HUNTER_ROGUE]: { name: 'Bounty Hunter (Rogue)' },
    [Activity.CLUE_SCROLLS_ALL]: { name: 'Clue Scrolls (All)' },
    [Activity.CLUE_SCROLLS_BEGINNER]: { name: 'Clue Scrolls (Beginner)' },
    [Activity.CLUE_SCROLLS_EASY]: { name: 'Clue Scrolls (Easy)' },
    [Activity.CLUE_SCROLLS_MEDIUM]: { name: 'Clue Scrolls (Medium)' },
    [Activity.CLUE_SCROLLS_HARD]: { name: 'Clue Scrolls (Hard)' },
    [Activity.CLUE_SCROLLS_ELITE]: { name: 'Clue Scrolls (Elite)' },
    [Activity.CLUE_SCROLLS_MASTER]: { name: 'Clue Scrolls (Master)' },
    [Activity.LAST_MAN_STANDING]: { name: 'Last Man Standing' },
    [Activity.PVP_ARENA]: { name: 'PvP Arena' },
    [Activity.SOUL_WARS_ZEAL]: { name: 'Soul Wars Zeal' },
    [Activity.GUARDIANS_OF_THE_RIFT]: { name: 'Guardians of the Rift' }
  },
  (props, key) => ({ ...props, key, type: MetricType.ACTIVITY, measure: MetricMeasure.SCORE })
);

const VirtualMetricProps = mapValues(
  {
    [VirtualMetric.EHP]: { name: 'EHP' },
    [VirtualMetric.EHB]: { name: 'EHB' }
  },
  (props, key) => ({ ...props, key, type: MetricType.VIRTUAL, measure: MetricMeasure.VALUE })
);

const Metrics = {
  ...Skill,
  ...Boss,
  ...Activity,
  ...VirtualMetric
};

const MetricProps = {
  ...SkillProps,
  ...BossProps,
  ...ActivityProps,
  ...VirtualMetricProps
};

type Metric = Skill | Boss | Activity | VirtualMetric;

const SKILLS = Object.values(Skill);
const BOSSES = Object.values(Boss);
const ACTIVITIES = Object.values(Activity);
const VIRTUAL_METRICS = Object.values(VirtualMetric);

const METRICS = [...SKILLS, ...BOSSES, ...ACTIVITIES, ...VIRTUAL_METRICS];

const F2P_BOSSES = BOSSES.filter(b => !MetricProps[b].isMembers);
const MEMBER_SKILLS = SKILLS.filter(s => MetricProps[s].isMembers);
const COMBAT_SKILLS = SKILLS.filter(s => MetricProps[s].isCombat);

function findMetric(metricName: string): Metric | null {
  for (var [key, value] of Object.entries(MetricProps)) {
    if (value.name.toUpperCase() === metricName.toUpperCase()) return key as Metric;
  }

  return null;
}

function isSkill(metric: Metric) {
  return metric in SkillProps;
}

function isBoss(metric: Metric) {
  return metric in BossProps;
}

function isActivity(metric: Metric) {
  return metric in ActivityProps;
}

function isVirtualMetric(metric: Metric) {
  return metric in VirtualMetricProps;
}

function getMetricRankKey(metric: Metric) {
  return `${metric}Rank`;
}

function getMetricValueKey(metric: Metric) {
  return `${metric}${capitalize(MetricProps[metric].measure)}`;
}

function getMetricMeasure(metric: Metric) {
  return MetricProps[metric].measure;
}

function getMetricName(metric: Metric) {
  return MetricProps[metric].name;
}

function getMinimumBossKc(metric: Metric) {
  return isBoss(metric) ? MetricProps[metric as Boss].minimumKc : 0;
}

function getParentVirtualMetric(metric: Metric) {
  if (isBoss(metric)) return Metrics.EHB;
  if (isSkill(metric)) return Metrics.EHP;
  return null;
}

function parseMetricAbbreviation(abbreviation: string): string | null {
  if (!abbreviation || abbreviation.length === 0) {
    return null;
  }

  switch (abbreviation.toLowerCase()) {
    // Bosses
    case 'sire':
      return Metrics.ABYSSAL_SIRE;

    case 'hydra':
      return Metrics.ALCHEMICAL_HYDRA;

    case 'barrows':
      return Metrics.BARROWS_CHESTS;

    case 'bryo':
      return Metrics.BRYOPHYTA;

    case 'cerb':
      return Metrics.CERBERUS;

    case 'cox':
    case 'xeric':
    case 'chambers':
    case 'olm':
    case 'raids':
      return Metrics.CHAMBERS_OF_XERIC;

    case 'cox-cm':
    case 'xeric-cm':
    case 'chambers-cm':
    case 'olm-cm':
    case 'raids-cm':
      return Metrics.CHAMBERS_OF_XERIC_CM;

    case 'chaos-ele':
      return Metrics.CHAOS_ELEMENTAL;

    case 'fanatic':
      return Metrics.CHAOS_FANATIC;

    case 'sara':
    case 'saradomin':
    case 'zilyana':
    case 'zily':
      return Metrics.COMMANDER_ZILYANA;

    case 'corp':
      return Metrics.CORPOREAL_BEAST;

    case 'crazy-arch':
      return Metrics.CRAZY_ARCHAEOLOGIST;

    case 'prime':
      return Metrics.DAGANNOTH_PRIME;
    case 'rex':
      return Metrics.DAGANNOTH_REX;
    case 'supreme':
      return Metrics.DAGANNOTH_SUPREME;

    case 'deranged-arch':
      return Metrics.DERANGED_ARCHAEOLOGIST;

    case 'bandos':
    case 'graardor':
      return Metrics.GENERAL_GRAARDOR;

    case 'mole':
      return Metrics.GIANT_MOLE;

    case 'dusk':
    case 'dawn':
    case 'gargs':
    case 'guardians':
    case 'ggs':
      return Metrics.GROTESQUE_GUARDIANS;

    case 'kq':
      return Metrics.KALPHITE_QUEEN;

    case 'kbd':
      return Metrics.KING_BLACK_DRAGON;

    case 'kree':
    case 'kreearra':
    case 'armadyl':
    case 'arma':
      return Metrics.KREEARRA;

    case 'zammy':
    case 'zamorak':
    case 'kril':
    case 'kril-tsutsaroth':
      return Metrics.KRIL_TSUTSAROTH;

    case 'gaunt':
    case 'gauntlet':
    case 'the-gauntlet':
      return Metrics.THE_GAUNTLET;

    case 'cgaunt':
    case 'cgauntlet':
    case 'corrupted':
    case 'corrupted-gauntlet':
    case 'the-corrupted-gauntlet':
      return Metrics.THE_CORRUPTED_GAUNTLET;

    case 'tob':
    case 'theatre':
    case 'verzik':
    case 'tob-normal':
      return Metrics.THEATRE_OF_BLOOD;

    case 'tob-hm':
    case 'tob-cm':
    case 'tob-hard-mode':
    case 'tob-hard':
      return Metrics.THEATRE_OF_BLOOD_HARD_MODE;

    case 'nm':
    case 'tnm':
    case 'nmare':
    case 'the-nightmare':
      return Metrics.NIGHTMARE;

    case 'pnm':
    case 'phosani':
    case 'phosanis':
    case 'phosani-nm':
    case 'phosani-nightmare':
    case 'phosanis nightmare':
      return Metrics.PHOSANIS_NIGHTMARE;

    case 'thermy':
    case 'smoke-devil':
      return Metrics.THERMONUCLEAR_SMOKE_DEVIL;

    case 'zuk':
    case 'inferno':
      return Metrics.TZKAL_ZUK;

    case 'jad':
    case 'fight-caves':
    case 'fc':
      return Metrics.TZTOK_JAD;

    case 'vork':
    case 'vorky':
      return Metrics.VORKATH;

    case 'wt':
      return Metrics.WINTERTODT;

    case 'snek':
    case 'zul':
      return Metrics.ZULRAH;

    // Minigames and others

    case 'all-clues':
    case 'clues':
      return Metrics.CLUE_SCROLLS_ALL;

    case 'beginner':
    case 'beginner-clues':
    case 'beg-clues':
    case 'beginners':
      return Metrics.CLUE_SCROLLS_BEGINNER;

    case 'easy':
    case 'easy-clues':
    case 'easies':
      return Metrics.CLUE_SCROLLS_EASY;

    case 'medium':
    case 'med':
    case 'meds':
    case 'medium-clues':
    case 'med-clues':
    case 'mediums':
      return Metrics.CLUE_SCROLLS_MEDIUM;

    case 'hard':
    case 'hard-clues':
    case 'hards':
      return Metrics.CLUE_SCROLLS_HARD;

    case 'elite':
    case 'elite-clues':
    case 'elites':
      return Metrics.CLUE_SCROLLS_ELITE;

    case 'master':
    case 'master-clues':
    case 'masters':
      return Metrics.CLUE_SCROLLS_MASTER;

    case 'lms':
      return Metrics.LAST_MAN_STANDING;

    case 'league':
    case 'lp':
    case 'lps':
      return Metrics.LEAGUE_POINTS;

    case 'sw':
    case 'zeal':
    case 'soul-wars':
      return Metrics.SOUL_WARS_ZEAL;

    // Skills

    case 'runecraft':
    case 'rc':
      return Metrics.RUNECRAFTING;

    case 'att':
    case 'atk':
    case 'attk':
      return Metrics.ATTACK;

    case 'def':
    case 'defense':
      return Metrics.DEFENCE;

    case 'str':
      return Metrics.STRENGTH;

    case 'hp':
      return Metrics.HITPOINTS;

    case 'range':
      return Metrics.RANGED;

    case 'pray':
      return Metrics.PRAYER;

    case 'mage':
      return Metrics.MAGIC;

    case 'cook':
      return Metrics.COOKING;

    case 'wc':
      return Metrics.WOODCUTTING;

    case 'fletch':
      return Metrics.FLETCHING;

    case 'fish':
      return Metrics.FISHING;

    case 'fm':
    case 'burning':
      return Metrics.FIREMAKING;

    case 'craft':
      return Metrics.CRAFTING;

    case 'sm':
    case 'smith':
      return Metrics.SMITHING;

    case 'mine':
    case 'smash':
      return Metrics.MINING;

    case 'herb':
      return Metrics.HERBLORE;

    case 'agi':
    case 'agil':
      return Metrics.AGILITY;

    case 'thief':
      return Metrics.THIEVING;

    case 'slay':
      return Metrics.SLAYER;

    case 'farm':
      return Metrics.FARMING;

    case 'hunt':
    case 'hunting':
      return Metrics.HUNTER;

    case 'con':
    case 'cons':
    case 'const':
      return Metrics.CONSTRUCTION;

    default:
      return abbreviation;
  }
}

export {
  // Types
  Metric,
  // Enums
  Metrics,
  MetricProps,
  MetricType,
  MetricMeasure,
  // Lists
  SKILLS,
  BOSSES,
  ACTIVITIES,
  VIRTUAL_METRICS,
  METRICS,
  F2P_BOSSES,
  MEMBER_SKILLS,
  COMBAT_SKILLS,
  // Functions
  findMetric,
  parseMetricAbbreviation,
  getMetricRankKey,
  getMetricValueKey,
  getMetricMeasure,
  getMetricName,
  getMinimumBossKc,
  getParentVirtualMetric,
  isSkill,
  isBoss,
  isActivity,
  isVirtualMetric
};
