import { METRICS, Metric, Metrics, getMetricMeasure, getLevel, getMetricValueKey } from '@wise-old-man/utils';
import { Snapshot } from '../../../database/models';
import { Achievement } from '../../../prisma';
import { ACHIEVEMENT_TEMPLATES } from './achievement.templates';
import { ExtendedAchievement, AchievementDefinition } from './achievement.types';

function extend(achievement: Achievement): ExtendedAchievement {
  const measure = getAchievementMeasure(achievement.metric, achievement.threshold);
  return { ...achievement, measure };
}

function getAchievementMeasure(metric: string, threshold: number): string {
  if (metric === Metrics.OVERALL && threshold <= 13_034_431) return 'levels';
  if (METRICS.includes(metric as Metric)) return getMetricMeasure(metric as Metric);
  return 'levels';
}

function getAchievemenName(name: string, threshold: number): string {
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
        return getCurrentValue
          ? getCurrentValue(snapshot, threshold)
          : snapshot[getMetricValueKey(metric as Metric)];
      };

      const validateFn = (snapshot: Snapshot) => {
        return getCurrentValueFn(snapshot) >= threshold;
      };

      definitions.push({
        name: newName,
        metric,
        measure,
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

  const dateMap: { [definitionName: string]: Date } = {};

  for (let i = 0; i < pastSnapshots.length - 2; i++) {
    const prev = pastSnapshots[i];
    const next = pastSnapshots[i + 1];

    // Include only definitions that are "newly" valid (between two snapshots)
    const valid = definitions.filter(d => {
      // Check if the previous value is > -1, this prevents this calc from setting the first snapshot
      // after May 10th 2020 as the achievement date for any pre-WOM boss achievements
      // (boss tracking was introduced on May 10th 2020)
      return !d.validate(prev) && d.validate(next) && prev[getMetricValueKey(d.metric as Metric)] > -1;
    });

    valid.forEach(v => {
      if (!(v.name in dateMap)) {
        dateMap[v.name] = next.createdAt;
      }
    });
  }

  return dateMap;
}

export { extend, calculatePastDates, getAchievementDefinitions };
