import {
  ACTIVITIES,
  Activity,
  Boss,
  BOSSES,
  ComputedMetric,
  Metric,
  MetricMeasure,
  MetricType,
  Skill,
  SKILLS
} from '../../types';
import { mapValues } from '../map-values.util';

export const SkillProps: Record<
  Skill,
  {
    name: string;
    isCombat: boolean;
    isMembers: boolean;
    type: MetricType;
    measure: MetricMeasure;
  }
> = mapValues(
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
    [Skill.CONSTRUCTION]: { name: 'Construction', isMembers: true },
    [Skill.SAILING]: { name: 'Sailing', isMembers: true }
  },
  props => ({
    ...props,
    type: MetricType.SKILL,
    measure: MetricMeasure.EXPERIENCE,
    isCombat: 'isCombat' in props ? props.isCombat : false,
    isMembers: 'isMembers' in props ? props.isMembers : false
  })
);

export const BossProps: Record<
  Boss,
  {
    name: string;
    minimumValue: number;
    isMembers: boolean;
    type: MetricType;
    measure: MetricMeasure;
  }
> = mapValues(
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
    [Boss.DOOM_OF_MOKHAIOTL]: { name: 'Doom of Mokhaiotl' },
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
    [Boss.SHELLBANE_GRYPHON]: { name: 'Shellbane Gryphon' },
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
    [Boss.YAMA]: { name: 'Yama' },
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

export const ActivityProps: Record<
  Activity,
  {
    name: string;
    minimumValue: number;
    type: MetricType;
    measure: MetricMeasure;
  }
> = mapValues(
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

export const ComputedMetricProps: Record<
  ComputedMetric,
  {
    name: string;
    type: MetricType;
    measure: MetricMeasure;
  }
> = mapValues(
  {
    [ComputedMetric.EHP]: { name: 'EHP' },
    [ComputedMetric.EHB]: { name: 'EHB' }
  },
  props => ({ ...props, type: MetricType.COMPUTED, measure: MetricMeasure.VALUE })
);

export const MetricProps = {
  ...SkillProps,
  ...BossProps,
  ...ActivityProps,
  ...ComputedMetricProps
} as const;

export const REAL_SKILLS = SKILLS.filter(s => s !== Skill.OVERALL) as Skill[];
export const F2P_BOSSES = BOSSES.filter(b => !MetricProps[b].isMembers) as Boss[];
export const MEMBER_SKILLS = SKILLS.filter(s => MetricProps[s].isMembers) as Skill[];
export const COMBAT_SKILLS = SKILLS.filter(s => MetricProps[s].isCombat) as Skill[];
export const REAL_METRICS = [...SKILLS, ...BOSSES, ...ACTIVITIES];

export function isMetric(metric: Metric | string): metric is Metric {
  return metric in MetricProps;
}

export function isSkill(metric: Metric | string): metric is Skill {
  return metric in SkillProps;
}

export function isActivity(metric: Metric | string): metric is Activity {
  return metric in ActivityProps;
}

export function isBoss(metric: Metric | string): metric is Boss {
  return metric in BossProps;
}

export function isComputedMetric(metric: Metric | string): metric is ComputedMetric {
  return metric in ComputedMetricProps;
}

export function getMinimumValue(metric: Metric) {
  return isBoss(metric) || isActivity(metric) ? MetricProps[metric].minimumValue : 1;
}

export function getParentEfficiencyMetric(metric: Metric) {
  if (isBoss(metric)) return Metric.EHB;
  if (isSkill(metric)) return Metric.EHP;
  return null;
}
