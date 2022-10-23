import {
  Metric,
  getMetricMeasure,
  getMetricValueKey,
  getLevel,
  SKILL_EXP_AT_99,
  isMetric,
  REAL_SKILLS
} from '../../../utils';
import { Achievement, Snapshot } from '../../../prisma';
import { ACHIEVEMENT_TEMPLATES } from './achievement.templates';
import { ExtendedAchievement, AchievementDefinition } from './achievement.types';

function extend(achievement: Achievement): ExtendedAchievement {
  const measure = getAchievementMeasure(achievement.metric, achievement.threshold);
  return { ...achievement, measure };
}

function getAchievementMeasure(metric: Metric, threshold: number): string {
  if (metric === Metric.OVERALL && threshold <= SKILL_EXP_AT_99) return 'levels';
  return getMetricMeasure(metric);
}

function getAchievemenName(name: string, threshold: number): string {
  if (name === 'Base {level} Stats') {
    threshold = threshold / REAL_SKILLS.length;
  }
  const newName = name
    .replace('{threshold}', formatThreshold(threshold))
    .replace('{level}', formatThreshold(threshold));

  if (newName === 'Base 99 Stats') {
    return 'Maxed Overall';
  }

  return newName;
}

function formatThreshold(threshold: number): string {
  if (threshold < 1000) return String(threshold);
  if (threshold <= 100_000) return `${Math.floor(threshold / 1000)}k`;

  if ([273_742, 737_627, 1_986_068, 5_346_332, 13_034_431].includes(threshold)) {
    return getLevel(threshold).toString();
  }

  if (threshold < 1_000_000_000)
    return `${Math.round((threshold / 1_000_000 + Number.EPSILON) * 100) / 100}m`;

  return `${Math.round((threshold / 1_000_000_000 + Number.EPSILON) * 100) / 100}b`;
}

function getAchievementDefinitions(): AchievementDefinition[] {
  const definitions = [];

  ACHIEVEMENT_TEMPLATES.forEach(({ thresholds, name, metric, measure, getCurrentValue }) => {
    thresholds.forEach(threshold => {
      const newName = getAchievemenName(name, threshold);

      const getCurrentValueFn = (snapshot: Snapshot) => {
        return getCurrentValue ? getCurrentValue(snapshot, threshold) : snapshot[getMetricValueKey(metric)];
      };

      const validateFn = (snapshot: Snapshot) => {
        return getCurrentValueFn(snapshot) >= threshold;
      };

      definitions.push({
        name: newName,
        metric,
        measure: measure || getMetricMeasure(metric),
        threshold,
        validate: validateFn,
        getCurrentValue: getCurrentValueFn
      });
    });
  });

  return definitions;
}

function calculatePastDates(pastSnapshots: Snapshot[], definitions: AchievementDefinition[]) {
  if (!definitions || definitions.length === 0) return {};

  // The player must have atleast 2 snapshots to find a achievement date
  if (!pastSnapshots || pastSnapshots.length < 2) return {};

  const dateMap: Record<string, { date: Date; accuracy: number }> = {};

  for (let i = 0; i < pastSnapshots.length - 2; i++) {
    const prev = pastSnapshots[i];
    const next = pastSnapshots[i + 1];

    // Include only definitions that are "newly" valid (between two snapshots)
    const valid = definitions.filter(d => {
      // Check if the previous value is > -1, this prevents this calc from setting the first snapshot
      // after May 10th 2020 as the achievement date for any pre-WOM boss achievements
      // (boss tracking was introduced on May 10th 2020)
      const wasRanked = !isMetric(d.metric) || prev[getMetricValueKey(d.metric)] > -1;
      return !d.validate(prev) && d.validate(next) && wasRanked;
    });

    valid.forEach(v => {
      if (!(v.name in dateMap)) {
        dateMap[v.name] = {
          date: next.createdAt,
          accuracy: next.createdAt.getTime() - prev.createdAt.getTime()
        };
      }
    });
  }

  return dateMap;
}

export { extend, calculatePastDates, getAchievementDefinitions };
