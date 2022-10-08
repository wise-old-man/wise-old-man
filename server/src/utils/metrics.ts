import { capitalize, mapValues } from 'lodash';
import { Skill, Boss, Activity, ComputedMetric, Metric } from '../prisma/enum-adapter';
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
  minimumKc: number;
  isMembers: boolean;
  type: MetricType;
  measure: MetricMeasure;
}

interface ActivityProperties {
  name: string;
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
  props => ({ ...props, type: MetricType.SKILL, measure: MetricMeasure.EXPERIENCE })
);

const BossProps: MapOf<Boss, BossProperties> = mapValues(
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
    [Boss.TOMBS_OF_AMASCUT_EXPERT]: {
      name: 'Tombs of Amascut (Expert Mode)',
      minimumKc: 50,
      isMembers: true
    },
    [Boss.TZKAL_ZUK]: { name: 'TzKal-Zuk', minimumKc: 1, isMembers: true },
    [Boss.TZTOK_JAD]: { name: 'TzTok-Jad', minimumKc: 5, isMembers: true },
    [Boss.VENENATIS]: { name: 'Venenatis', minimumKc: 50, isMembers: true },
    [Boss.VETION]: { name: "Vet'ion", minimumKc: 50, isMembers: true },
    [Boss.VORKATH]: { name: 'Vorkath', minimumKc: 50, isMembers: true },
    [Boss.WINTERTODT]: { name: 'Wintertodt', minimumKc: 50, isMembers: true },
    [Boss.ZALCANO]: { name: 'Zalcano', minimumKc: 50, isMembers: true },
    [Boss.ZULRAH]: { name: 'Zulrah', minimumKc: 50, isMembers: true }
  },
  props => ({ ...props, type: MetricType.BOSS, measure: MetricMeasure.KILLS })
);

const ActivityProps: MapOf<Activity, ActivityProperties> = mapValues(
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
  props => ({ ...props, type: MetricType.ACTIVITY, measure: MetricMeasure.SCORE })
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

const REAL_SKILLS = SKILLS.filter(s => s !== Skill.OVERALL);
const F2P_BOSSES = BOSSES.filter(b => !MetricProps[b].isMembers);
const MEMBER_SKILLS = SKILLS.filter(s => MetricProps[s].isMembers);
const COMBAT_SKILLS = SKILLS.filter(s => MetricProps[s].isCombat);

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

function getParentEfficiencyMetric(metric: Metric) {
  if (isBoss(metric)) return Metric.EHB;
  if (isSkill(metric)) return Metric.EHP;
  return null;
}

function parseMetricAbbreviation(abbreviation: string): Metric | null {
  if (!abbreviation || abbreviation.length === 0) {
    return null;
  }

  const fixedAbbreviation = abbreviation.toLowerCase();

  if (isMetric(fixedAbbreviation)) {
    return fixedAbbreviation;
  }

  switch (fixedAbbreviation) {
    // Bosses
    case 'sire':
      return Metric.ABYSSAL_SIRE;

    case 'hydra':
      return Metric.ALCHEMICAL_HYDRA;

    case 'barrows':
      return Metric.BARROWS_CHESTS;

    case 'bryo':
      return Metric.BRYOPHYTA;

    case 'cerb':
      return Metric.CERBERUS;

    case 'cox':
    case 'xeric':
    case 'chambers':
    case 'olm':
    case 'raids':
      return Metric.CHAMBERS_OF_XERIC;

    case 'cox-cm':
    case 'xeric-cm':
    case 'chambers-cm':
    case 'olm-cm':
    case 'raids-cm':
      return Metric.CHAMBERS_OF_XERIC_CM;

    case 'chaos-ele':
      return Metric.CHAOS_ELEMENTAL;

    case 'fanatic':
      return Metric.CHAOS_FANATIC;

    case 'sara':
    case 'saradomin':
    case 'zilyana':
    case 'zily':
      return Metric.COMMANDER_ZILYANA;

    case 'corp':
      return Metric.CORPOREAL_BEAST;

    case 'crazy-arch':
      return Metric.CRAZY_ARCHAEOLOGIST;

    case 'prime':
      return Metric.DAGANNOTH_PRIME;
    case 'rex':
      return Metric.DAGANNOTH_REX;
    case 'supreme':
      return Metric.DAGANNOTH_SUPREME;

    case 'deranged-arch':
      return Metric.DERANGED_ARCHAEOLOGIST;

    case 'bandos':
    case 'graardor':
      return Metric.GENERAL_GRAARDOR;

    case 'mole':
      return Metric.GIANT_MOLE;

    case 'dusk':
    case 'dawn':
    case 'gargs':
    case 'guardians':
    case 'ggs':
      return Metric.GROTESQUE_GUARDIANS;

    case 'kq':
      return Metric.KALPHITE_QUEEN;

    case 'kbd':
      return Metric.KING_BLACK_DRAGON;

    case 'kree':
    case 'kreearra':
    case 'armadyl':
    case 'arma':
      return Metric.KREEARRA;

    case 'zammy':
    case 'zamorak':
    case 'kril':
    case 'kril-tsutsaroth':
      return Metric.KRIL_TSUTSAROTH;

    case 'gaunt':
    case 'gauntlet':
    case 'the-gauntlet':
      return Metric.THE_GAUNTLET;

    case 'cgaunt':
    case 'cgauntlet':
    case 'corrupted':
    case 'corrupted-gauntlet':
    case 'the-corrupted-gauntlet':
      return Metric.THE_CORRUPTED_GAUNTLET;

    case 'tob':
    case 'theatre':
    case 'verzik':
    case 'tob-normal':
      return Metric.THEATRE_OF_BLOOD;

    case 'tob-hm':
    case 'tob-cm':
    case 'tob-hard-mode':
    case 'tob-hard':
      return Metric.THEATRE_OF_BLOOD_HARD_MODE;

    case 'toa':
    case 'tombs':
    case 'amascut':
      return Metric.TOMBS_OF_AMASCUT;

    case 'toa-expert':
    case 'toa-hm':
    case 'tombs-expert':
    case 'tombs-hm':
    case 'amascut-expert':
    case 'amascut-hm':
      return Metric.TOMBS_OF_AMASCUT_EXPERT;

    case 'nm':
    case 'tnm':
    case 'nmare':
    case 'the-nightmare':
      return Metric.NIGHTMARE;

    case 'pnm':
    case 'phosani':
    case 'phosanis':
    case 'phosani-nm':
    case 'phosani-nightmare':
    case 'phosanis nightmare':
      return Metric.PHOSANIS_NIGHTMARE;

    case 'thermy':
    case 'smoke-devil':
      return Metric.THERMONUCLEAR_SMOKE_DEVIL;

    case 'zuk':
    case 'inferno':
      return Metric.TZKAL_ZUK;

    case 'jad':
    case 'fight-caves':
    case 'fc':
      return Metric.TZTOK_JAD;

    case 'vork':
    case 'vorky':
      return Metric.VORKATH;

    case 'wt':
      return Metric.WINTERTODT;

    case 'snek':
    case 'zul':
      return Metric.ZULRAH;

    // Minigames and others

    case 'all-clues':
    case 'clues':
      return Metric.CLUE_SCROLLS_ALL;

    case 'beginner':
    case 'beginner-clues':
    case 'beg-clues':
    case 'beginners':
      return Metric.CLUE_SCROLLS_BEGINNER;

    case 'easy':
    case 'easy-clues':
    case 'easies':
      return Metric.CLUE_SCROLLS_EASY;

    case 'medium':
    case 'med':
    case 'meds':
    case 'medium-clues':
    case 'med-clues':
    case 'mediums':
      return Metric.CLUE_SCROLLS_MEDIUM;

    case 'hard':
    case 'hard-clues':
    case 'hards':
      return Metric.CLUE_SCROLLS_HARD;

    case 'elite':
    case 'elite-clues':
    case 'elites':
      return Metric.CLUE_SCROLLS_ELITE;

    case 'master':
    case 'master-clues':
    case 'masters':
      return Metric.CLUE_SCROLLS_MASTER;

    case 'lms':
      return Metric.LAST_MAN_STANDING;

    case 'league':
    case 'lp':
    case 'lps':
      return Metric.LEAGUE_POINTS;

    case 'sw':
    case 'zeal':
    case 'soul-wars':
      return Metric.SOUL_WARS_ZEAL;

    // Skills

    case 'runecraft':
    case 'rc':
      return Metric.RUNECRAFTING;

    case 'att':
    case 'atk':
    case 'attk':
      return Metric.ATTACK;

    case 'def':
    case 'defense':
      return Metric.DEFENCE;

    case 'str':
      return Metric.STRENGTH;

    case 'hp':
      return Metric.HITPOINTS;

    case 'range':
      return Metric.RANGED;

    case 'pray':
      return Metric.PRAYER;

    case 'mage':
      return Metric.MAGIC;

    case 'cook':
      return Metric.COOKING;

    case 'wc':
      return Metric.WOODCUTTING;

    case 'fletch':
      return Metric.FLETCHING;

    case 'fish':
      return Metric.FISHING;

    case 'fm':
    case 'burning':
      return Metric.FIREMAKING;

    case 'craft':
      return Metric.CRAFTING;

    case 'sm':
    case 'smith':
      return Metric.SMITHING;

    case 'mine':
    case 'smash':
      return Metric.MINING;

    case 'herb':
      return Metric.HERBLORE;

    case 'agi':
    case 'agil':
      return Metric.AGILITY;

    case 'thief':
      return Metric.THIEVING;

    case 'slay':
      return Metric.SLAYER;

    case 'farm':
      return Metric.FARMING;

    case 'hunt':
    case 'hunting':
      return Metric.HUNTER;

    case 'con':
    case 'cons':
    case 'const':
      return Metric.CONSTRUCTION;

    default:
      return null;
  }
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
  // Functions
  findMetric,
  parseMetricAbbreviation,
  getMetricRankKey,
  getMetricValueKey,
  getMetricMeasure,
  getMetricName,
  getMinimumBossKc,
  getParentEfficiencyMetric,
  isMetric,
  isSkill,
  isActivity,
  isBoss,
  isComputedMetric
};
