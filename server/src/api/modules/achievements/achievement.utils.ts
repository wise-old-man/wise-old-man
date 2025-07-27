import { AchievementDefinition, Snapshot } from '../../../types';
import { formatNumber } from '../../../utils/format-number.util';
import { getMetricValueKey } from '../../../utils/get-metric-value-key.util';
import { getLevel, isMetric, MetricProps, REAL_SKILLS } from '../../../utils/shared';
import { ACHIEVEMENT_TEMPLATES } from './achievement.templates';

function getAchievementName(name: string, threshold: number): string {
  const adjustedThreshold = name === 'Base {level} Stats' ? threshold / REAL_SKILLS.length : threshold;

  const newName = name
    .replace('{threshold}', formatThreshold(adjustedThreshold))
    .replace('{level}', formatThreshold(adjustedThreshold));

  if (newName === 'Base 99 Stats') {
    return 'Maxed Overall';
  }

  return newName;
}

function formatThreshold(threshold: number): string {
  if (threshold < 1000) return String(threshold);
  if (threshold <= 10_000) return `${threshold / 1000}k`;

  if ([273_742, 737_627, 1_986_068, 5_346_332, 13_034_431].includes(threshold)) {
    return getLevel(threshold).toString();
  }

  return formatNumber(threshold, true).toString();
}

export function getAchievementDefinitions(): AchievementDefinition[] {
  const definitions: AchievementDefinition[] = [];

  ACHIEVEMENT_TEMPLATES.forEach(({ thresholds, name, metric, measure, getCurrentValue }) => {
    const metricValueKey = getMetricValueKey(metric);

    thresholds.forEach(threshold => {
      const newName = getAchievementName(name, threshold);

      const getCurrentValueFn = (snapshot: Snapshot) => {
        return getCurrentValue ? getCurrentValue(snapshot, threshold) : snapshot[metricValueKey];
      };

      const validateFn = (snapshot: Snapshot) => {
        return getCurrentValueFn(snapshot) >= threshold;
      };

      definitions.push({
        name: newName,
        metric,
        measure: measure ?? MetricProps[metric].measure,
        threshold,
        validate: validateFn,
        getCurrentValue: getCurrentValueFn
      });
    });
  });

  return definitions;
}

export function calculatePastDates(pastSnapshots: Snapshot[], definitions: AchievementDefinition[]) {
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
