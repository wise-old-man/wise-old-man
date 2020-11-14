import { METRICS_CONFIG, SKILLS, ACTIVITIES, BOSSES } from 'config/metrics';

export function getMetricIcon(metric, smallVersion) {
  const folder = smallVersion ? 'icons_small' : 'icons';
  return `/img/runescape/${folder}/${metric}.png`;
}

export function getType(value) {
  if (isSkill(value)) {
    return 'skill';
  }

  if (isActivity(value)) {
    return 'activity';
  }

  return 'boss';
}

export function isSkill(value) {
  return SKILLS.includes(value);
}

export function isActivity(value) {
  return ACTIVITIES.includes(value);
}

export function isBoss(value) {
  return BOSSES.includes(value);
}

export function getMinimumBossKc(value) {
  switch (value) {
    case 'mimic':
    case 'tzkal_zuk':
      return 2;
    case 'bryophyta':
    case 'chambers_of_xeric_challenge_mode':
    case 'hespori':
    case 'obor':
    case 'skotizo':
    case 'the_corrupted_gauntlet':
    case 'tztok_jad':
      return 10;
    default:
      return 50;
  }
}

export function getMeasure(value) {
  if (isSkill(value)) {
    return 'experience';
  }

  if (isActivity(value)) {
    return 'score';
  }

  if (isBoss(value)) {
    return 'kills';
  }

  return 'value';
}

export function getRankKey(value) {
  return `${value}Rank`;
}

export function getValueKey(value) {
  if (isSkill(value)) {
    return `${value}Experience`;
  }

  if (isActivity(value)) {
    return `${value}Score`;
  }

  return `${value}Kills`;
}

export function getMetricName(value) {
  if (value === 'combat') {
    return 'Combat';
  }

  if (value === 'ehp+ehb') {
    return 'EHP + EHB';
  }

  for (let i = 0; i < METRICS_CONFIG.SKILLS.length; i += 1) {
    if (METRICS_CONFIG.SKILLS[i].key === value) {
      return METRICS_CONFIG.SKILLS[i].name;
    }
  }

  for (let i = 0; i < METRICS_CONFIG.ACTIVITIES.length; i += 1) {
    if (METRICS_CONFIG.ACTIVITIES[i].key === value) {
      return METRICS_CONFIG.ACTIVITIES[i].name;
    }
  }

  for (let i = 0; i < METRICS_CONFIG.BOSSES.length; i += 1) {
    if (METRICS_CONFIG.BOSSES[i].key === value) {
      return METRICS_CONFIG.BOSSES[i].name;
    }
  }

  for (let i = 0; i < METRICS_CONFIG.VIRTUALS.length; i += 1) {
    if (METRICS_CONFIG.VIRTUALS[i].key === value) {
      return METRICS_CONFIG.VIRTUALS[i].name;
    }
  }

  return 'Invalid metric name';
}
