import { getCombatLevel, getTotalLevel } from '../../util/level';

const SKILL_TEMPLATES = [
  {
    type: '{threshold} {skill}',
    measure: 'experience',
    thresholds: [13034431, 50000000, 100000000, 200000000]
  },
  {
    type: '{threshold} Overall Exp.',
    metric: 'overall',
    measure: 'experience',
    thresholds: [500000000, 1000000000, 2000000000, 4600000000],
    validate: (snapshot, threshold) => snapshot.overallExperience >= threshold
  },
  {
    type: 'Maxed Overall',
    metric: 'overall',
    measure: 'levels',
    thresholds: [2277],
    validate: snapshot => getTotalLevel(snapshot) === 2277
  },
  {
    type: 'Maxed combat',
    metric: 'combat',
    measure: 'levels',
    thresholds: [126],
    validate: snapshot => getCombatLevel(snapshot) === 126
  }
];

const ACTIVITY_TEMPLATES = [
  {
    type: '{threshold} {activity} score',
    measure: 'score',
    thresholds: [1000, 5000, 10000]
  }
];

const BOSS_TEMPLATES = [
  {
    type: '{threshold} {boss} kills',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10000]
  }
];

export {
  SKILL_TEMPLATES,
  ACTIVITY_TEMPLATES,
  BOSS_TEMPLATES
};