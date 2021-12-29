import { mapValues } from 'lodash';

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
  SOUL_WARS_ZEAL = 'soul_wars_zeal'
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
    [Boss.BRYOPHYTA]: { name: 'Bryophyta', minimumKc: 10, isMembers: false },
    [Boss.CALLISTO]: { name: 'Callisto', minimumKc: 50, isMembers: true },
    [Boss.CERBERUS]: { name: 'Cerberus', minimumKc: 50, isMembers: true },
    [Boss.CHAMBERS_OF_XERIC]: { name: 'Chambers Of Xeric', minimumKc: 50, isMembers: true },
    [Boss.CHAMBERS_OF_XERIC_CM]: { name: 'Chambers Of Xeric (CM)', minimumKc: 10, isMembers: true },
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
    [Boss.HESPORI]: { name: 'Hespori', minimumKc: 10, isMembers: true },
    [Boss.KALPHITE_QUEEN]: { name: 'Kalphite Queen', minimumKc: 50, isMembers: true },
    [Boss.KING_BLACK_DRAGON]: { name: 'King Black Dragon', minimumKc: 50, isMembers: true },
    [Boss.KRAKEN]: { name: 'Kraken', minimumKc: 50, isMembers: true },
    [Boss.KREEARRA]: { name: "Kree'Arra", minimumKc: 50, isMembers: true },
    [Boss.KRIL_TSUTSAROTH]: { name: "K'ril Tsutsaroth", minimumKc: 50, isMembers: true },
    [Boss.MIMIC]: { name: 'Mimic', minimumKc: 2, isMembers: true },
    [Boss.NIGHTMARE]: { name: 'Nightmare', minimumKc: 50, isMembers: true },
    [Boss.PHOSANIS_NIGHTMARE]: { name: "Phosani's Nightmare", minimumKc: 50, isMembers: true },
    [Boss.OBOR]: { name: 'Obor', minimumKc: 10, isMembers: false },
    [Boss.SARACHNIS]: { name: 'Sarachnis', minimumKc: 50, isMembers: true },
    [Boss.SCORPIA]: { name: 'Scorpia', minimumKc: 50, isMembers: true },
    [Boss.SKOTIZO]: { name: 'Skotizo', minimumKc: 10, isMembers: true },
    [Boss.TEMPOROSS]: { name: 'Tempoross', minimumKc: 50, isMembers: true },
    [Boss.THE_GAUNTLET]: { name: 'The Gauntlet', minimumKc: 50, isMembers: true },
    [Boss.THE_CORRUPTED_GAUNTLET]: { name: 'The Corrupted Gauntlet', minimumKc: 10, isMembers: true },
    [Boss.THEATRE_OF_BLOOD]: { name: 'Theatre Of Blood', minimumKc: 50, isMembers: true },
    [Boss.THEATRE_OF_BLOOD_HARD_MODE]: { name: 'Theatre Of Blood (HM)', minimumKc: 50, isMembers: true },
    [Boss.THERMONUCLEAR_SMOKE_DEVIL]: { name: 'Thermonuclear Smoke Devil', minimumKc: 50, isMembers: true },
    [Boss.TZKAL_ZUK]: { name: 'TzKal-Zuk', minimumKc: 2, isMembers: true },
    [Boss.TZTOK_JAD]: { name: 'TzTok-Jad', minimumKc: 10, isMembers: true },
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
    [Activity.SOUL_WARS_ZEAL]: { name: 'Soul Wars Zeal' }
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

function findMetric(metricName: string): Metric | null {
  for (var [key, value] of Object.entries(MetricProps)) {
    if (value.name === metricName) return key as Metric;
  }

  return null;
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
  // Functions
  findMetric
};
