import { Skill, Boss, Activity, ComputedMetric, Metric } from '../prisma/enum-adapter';
import { mapValues } from '../api/util/objects';
import { MapOf } from './types';

enum MetricType {
  SKILL = 'skill',
  BOSS = 'boss',
  ACTIVITY = 'activity',
  COMPUTED = 'computed'
}

enum MetricMeasure {
  EXPERIENCE = 'experience',
  KILLS = 'kills',
  SCORE = 'score',
  VALUE = 'value'
}

interface SkillProperties {
  name: string;
  isCombat: boolean;
  isMembers: boolean;
  type: MetricType;
  measure: MetricMeasure;
}

interface BossProperties {
  name: string;
  minimumValue: number;
  isMembers: boolean;
  type: MetricType;
  measure: MetricMeasure;
}

interface ActivityProperties {
  name: string;
  minimumValue: number;
  type: MetricType;
  measure: MetricMeasure;
}

interface ComputedMetricProperties {
  name: string;
  type: MetricType;
  measure: MetricMeasure;
}

const SkillProps: MapOf<Skill, SkillProperties> = mapValues(
  {
    [Skill.OVERALL]: { name: 'Overall' },
    [Skill.ATTACK]: { name: 'Attack', isCombat: true },
    [Skill.DEFENCE]: { name: 'Defence', isCombat: true },
    [Skill.STRENGTH]: { name: 'Strength', isCombat: true },
    [Skill.HITPOINTS]: { name: 'Hitpoints', isCombat: true },
    [Skill.RANGED]: { name: 'Ranged', isCombat: true },
    [Skill.PRAYER]: { name: 'Prayer', isCombat: true },
    [Skill.MAGIC]: { name: 'Magic', isCombat: true },
    [Skill.COOKING]: { name: 'Cooking' },
    [Skill.WOODCUTTING]: { name: 'Woodcutting' },
    [Skill.FLETCHING]: { name: 'Fletching', isMembers: true },
    [Skill.FISHING]: { name: 'Fishing' },
    [Skill.FIREMAKING]: { name: 'Firemaking' },
    [Skill.CRAFTING]: { name: 'Crafting' },
    [Skill.SMITHING]: { name: 'Smithing' },
    [Skill.MINING]: { name: 'Mining' },
    [Skill.HERBLORE]: { name: 'Herblore', isMembers: true },
    [Skill.AGILITY]: { name: 'Agility', isMembers: true },
    [Skill.THIEVING]: { name: 'Thieving', isMembers: true },
    [Skill.SLAYER]: { name: 'Slayer', isMembers: true },
    [Skill.FARMING]: { name: 'Farming', isMembers: true },
    [Skill.RUNECRAFTING]: { name: 'Runecrafting' },
    [Skill.HUNTER]: { name: 'Hunter', isMembers: true },
    [Skill.CONSTRUCTION]: { name: 'Construction', isMembers: true }
  },
  props => ({
    ...props,
    type: MetricType.SKILL,
    measure: MetricMeasure.EXPERIENCE,
    isCombat: 'isCombat' in props ? props.isCombat : false,
    isMembers: 'isMembers' in props ? props.isMembers : false
  })
);

const BossProps: MapOf<Boss, BossProperties> = mapValues(
  {
    [Boss.ABYSSAL_SIRE]: { name: 'Abyssal Sire' },
    [Boss.ALCHEMICAL_HYDRA]: { name: 'Alchemical Hydra' },
    [Boss.AMOXLIATL]: { name: 'Amoxliatl' },
    [Boss.ARAXXOR]: { name: 'Araxxor' },
    [Boss.ARTIO]: { name: 'Artio' },
    [Boss.BARROWS_CHESTS]: { name: 'Barrows Chests' },
    [Boss.BRYOPHYTA]: { name: 'Bryophyta', isMembers: false },
    [Boss.CALLISTO]: { name: 'Callisto' },
    [Boss.CALVARION]: { name: "Calvar'ion" },
    [Boss.CERBERUS]: { name: 'Cerberus' },
    [Boss.CHAMBERS_OF_XERIC]: { name: 'Chambers Of Xeric' },
    [Boss.CHAMBERS_OF_XERIC_CM]: { name: 'Chambers Of Xeric (CM)' },
    [Boss.CHAOS_ELEMENTAL]: { name: 'Chaos Elemental' },
    [Boss.CHAOS_FANATIC]: { name: 'Chaos Fanatic' },
    [Boss.COMMANDER_ZILYANA]: { name: 'Commander Zilyana' },
    [Boss.CORPOREAL_BEAST]: { name: 'Corporeal Beast' },
    [Boss.CRAZY_ARCHAEOLOGIST]: { name: 'Crazy Archaeologist' },
    [Boss.DAGANNOTH_PRIME]: { name: 'Dagannoth Prime' },
    [Boss.DAGANNOTH_REX]: { name: 'Dagannoth Rex' },
    [Boss.DAGANNOTH_SUPREME]: { name: 'Dagannoth Supreme' },
    [Boss.DERANGED_ARCHAEOLOGIST]: { name: 'Deranged Archaeologist' },
    [Boss.DUKE_SUCELLUS]: { name: 'Duke Sucellus' },
    [Boss.GENERAL_GRAARDOR]: { name: 'General Graardor' },
    [Boss.GIANT_MOLE]: { name: 'Giant Mole' },
    [Boss.GROTESQUE_GUARDIANS]: { name: 'Grotesque Guardians' },
    [Boss.HESPORI]: { name: 'Hespori' },
    [Boss.THE_HUEYCOATL]: { name: 'The Hueycoatl' },
    [Boss.KALPHITE_QUEEN]: { name: 'Kalphite Queen' },
    [Boss.KING_BLACK_DRAGON]: { name: 'King Black Dragon' },
    [Boss.KRAKEN]: { name: 'Kraken' },
    [Boss.KREEARRA]: { name: "Kree'Arra" },
    [Boss.KRIL_TSUTSAROTH]: { name: "K'ril Tsutsaroth" },
    [Boss.LUNAR_CHESTS]: { name: 'Lunar Chests' },
    [Boss.MIMIC]: { name: 'Mimic', minimumValue: 1 },
    [Boss.NEX]: { name: 'Nex' },
    [Boss.NIGHTMARE]: { name: 'Nightmare' },
    [Boss.PHOSANIS_NIGHTMARE]: { name: "Phosani's Nightmare" },
    [Boss.OBOR]: { name: 'Obor', isMembers: false },
    [Boss.PHANTOM_MUSPAH]: { name: 'Phantom Muspah' },
    [Boss.SARACHNIS]: { name: 'Sarachnis' },
    [Boss.SCORPIA]: { name: 'Scorpia' },
    [Boss.SCURRIUS]: { name: 'Scurrius' },
    [Boss.SKOTIZO]: { name: 'Skotizo' },
    [Boss.SOL_HEREDIT]: { name: 'Sol Heredit' },
    [Boss.SPINDEL]: { name: 'Spindel' },
    [Boss.TEMPOROSS]: { name: 'Tempoross' },
    [Boss.THE_GAUNTLET]: { name: 'The Gauntlet' },
    [Boss.THE_CORRUPTED_GAUNTLET]: { name: 'The Corrupted Gauntlet' },
    [Boss.THE_LEVIATHAN]: { name: 'The Leviathan' },
    [Boss.THE_ROYAL_TITANS]: { name: 'The Royal Titans' },
    [Boss.THE_WHISPERER]: { name: 'The Whisperer' },
    [Boss.THEATRE_OF_BLOOD]: { name: 'Theatre Of Blood' },
    [Boss.THEATRE_OF_BLOOD_HARD_MODE]: { name: 'Theatre Of Blood (HM)' },
    [Boss.THERMONUCLEAR_SMOKE_DEVIL]: { name: 'Thermonuclear Smoke Devil' },
    [Boss.TOMBS_OF_AMASCUT]: { name: 'Tombs of Amascut' },
    [Boss.TOMBS_OF_AMASCUT_EXPERT]: { name: 'Tombs of Amascut (Expert Mode)' },
    [Boss.TZKAL_ZUK]: { name: 'TzKal-Zuk', minimumValue: 1 },
    [Boss.TZTOK_JAD]: { name: 'TzTok-Jad' },
    [Boss.VARDORVIS]: { name: 'Vardorvis' },
    [Boss.VENENATIS]: { name: 'Venenatis' },
    [Boss.VETION]: { name: "Vet'ion" },
    [Boss.VORKATH]: { name: 'Vorkath' },
    [Boss.WINTERTODT]: { name: 'Wintertodt' },
    [Boss.ZALCANO]: { name: 'Zalcano' },
    [Boss.ZULRAH]: { name: 'Zulrah' }
  },
  props => ({
    ...props,
    type: MetricType.BOSS,
    measure: MetricMeasure.KILLS,
    isMembers: 'isMembers' in props ? props.isMembers : true,
    minimumValue: 'minimumValue' in props ? props.minimumValue : 5
  })
);

const ActivityProps: MapOf<Activity, ActivityProperties> = mapValues(
  {
    [Activity.LEAGUE_POINTS]: { name: 'League Points', minimumValue: 100 },
    [Activity.BOUNTY_HUNTER_HUNTER]: { name: 'Bounty Hunter (Hunter)', minimumValue: 2 },
    [Activity.BOUNTY_HUNTER_ROGUE]: { name: 'Bounty Hunter (Rogue)', minimumValue: 2 },
    [Activity.CLUE_SCROLLS_ALL]: { name: 'Clue Scrolls (All)' },
    [Activity.CLUE_SCROLLS_BEGINNER]: { name: 'Clue Scrolls (Beginner)' },
    [Activity.CLUE_SCROLLS_EASY]: { name: 'Clue Scrolls (Easy)' },
    [Activity.CLUE_SCROLLS_MEDIUM]: { name: 'Clue Scrolls (Medium)' },
    [Activity.CLUE_SCROLLS_HARD]: { name: 'Clue Scrolls (Hard)' },
    [Activity.CLUE_SCROLLS_ELITE]: { name: 'Clue Scrolls (Elite)' },
    [Activity.CLUE_SCROLLS_MASTER]: { name: 'Clue Scrolls (Master)' },
    [Activity.LAST_MAN_STANDING]: { name: 'Last Man Standing', minimumValue: 500 },
    [Activity.PVP_ARENA]: { name: 'PvP Arena', minimumValue: 2525 },
    [Activity.SOUL_WARS_ZEAL]: { name: 'Soul Wars Zeal', minimumValue: 200 },
    [Activity.GUARDIANS_OF_THE_RIFT]: { name: 'Guardians of the Rift', minimumValue: 2 },
    [Activity.COLOSSEUM_GLORY]: { name: 'Colosseum Glory', minimumValue: 300 },
    [Activity.COLLECTIONS_LOGGED]: { name: 'Collection Logs', minimumValue: 500 }
  },
  props => ({
    ...props,
    type: MetricType.ACTIVITY,
    measure: MetricMeasure.SCORE,
    minimumValue: 'minimumValue' in props ? props.minimumValue : 1
  })
);

const ComputedMetricProps: MapOf<ComputedMetric, ComputedMetricProperties> = mapValues(
  {
    [ComputedMetric.EHP]: { name: 'EHP' },
    [ComputedMetric.EHB]: { name: 'EHB' }
  },
  props => ({ ...props, type: MetricType.COMPUTED, measure: MetricMeasure.VALUE })
);

const MetricProps = {
  ...SkillProps,
  ...BossProps,
  ...ActivityProps,
  ...ComputedMetricProps
} as const;

const METRICS = Object.values(Metric) as Metric[];
const SKILLS = Object.values(Skill) as Skill[];
const BOSSES = Object.values(Boss) as Boss[];
const ACTIVITIES = Object.values(Activity) as Activity[];
const COMPUTED_METRICS = Object.values(ComputedMetric) as ComputedMetric[];

const REAL_SKILLS = SKILLS.filter(s => s !== Skill.OVERALL) as Skill[];
const F2P_BOSSES = BOSSES.filter(b => !MetricProps[b].isMembers) as Boss[];
const MEMBER_SKILLS = SKILLS.filter(s => MetricProps[s].isMembers) as Skill[];
const COMBAT_SKILLS = SKILLS.filter(s => MetricProps[s].isCombat) as Skill[];
const REAL_METRICS = [...SKILLS, ...BOSSES, ...ACTIVITIES];

function findMetric(metricName: string): Metric | null {
  for (const [key, value] of Object.entries(MetricProps)) {
    if (value.name.toUpperCase() === metricName.toUpperCase()) return key as Metric;
  }

  return null;
}

function isMetric(metric: Metric | string): metric is Metric {
  return metric in MetricProps;
}

function isSkill(metric: Metric | string): metric is Skill {
  return metric in SkillProps;
}

function isActivity(metric: Metric | string): metric is Activity {
  return metric in ActivityProps;
}

function isBoss(metric: Metric | string): metric is Boss {
  return metric in BossProps;
}

function isComputedMetric(metric: Metric | string): metric is ComputedMetric {
  return metric in ComputedMetricProps;
}

function getMetricRankKey<T extends Metric>(metric: T): `${T}Rank` {
  return `${metric}Rank`;
}

export type MetricValueKey =
  | `${Skill}Experience`
  | `${Boss}Kills`
  | `${Activity}Score`
  | `${ComputedMetric}Value`;

// Maybe someday I'll be good enough with TS to restrict the return type to the input metric type
function getMetricValueKey(metric: Metric): MetricValueKey {
  if (isSkill(metric)) {
    return `${metric}Experience`;
  }

  if (isBoss(metric)) {
    return `${metric}Kills`;
  }

  if (isActivity(metric)) {
    return `${metric}Score`;
  }

  return `${metric}Value`;
}

function getMetricMeasure(metric: Metric) {
  return MetricProps[metric].measure;
}

function getMetricName(metric: Metric) {
  return MetricProps[metric].name;
}

function getMinimumValue(metric: Metric) {
  return isBoss(metric) || isActivity(metric) ? MetricProps[metric].minimumValue : 1;
}

function getParentEfficiencyMetric(metric: Metric) {
  if (isBoss(metric)) return Metric.EHB;
  if (isSkill(metric)) return Metric.EHP;
  return null;
}

export {
  // Enums
  Metric,
  Skill,
  Boss,
  Activity,
  ComputedMetric,
  MetricType,
  MetricMeasure,
  // Maps
  MetricProps,
  // Lists
  SKILLS,
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  METRICS,
  F2P_BOSSES,
  REAL_SKILLS,
  MEMBER_SKILLS,
  COMBAT_SKILLS,
  REAL_METRICS,
  // Functions
  findMetric,
  getMetricRankKey,
  getMetricValueKey,
  getMetricMeasure,
  getMetricName,
  getMinimumValue,
  getParentEfficiencyMetric,
  isMetric,
  isSkill,
  isActivity,
  isBoss,
  isComputedMetric
};
