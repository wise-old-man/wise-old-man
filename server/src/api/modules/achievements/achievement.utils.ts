import prisma from '../../../prisma';
import { AchievementDefinition, Snapshot } from '../../../types';
import { getMetricValueKey } from '../../../utils/get-metric-value-key.util';
import { getExpForLevel, getLevel, isMetric, MetricProps } from '../../../utils/shared';
import { formatNumber } from '../../../utils/shared/format-number.util';
import { ACHIEVEMENT_TEMPLATES } from './achievement.templates';

function formatAchievementThreshold(templateName: string, threshold: number): string {
  if (threshold < 1000) return String(threshold);
  if (threshold <= 10_000) return `${threshold / 1000}k`;

  if (threshold === getExpForLevel(99)) {
    return '99';
  }

  if (templateName.startsWith('Base {level} Stats')) {
    return getLevel(threshold / 23).toString();
  }

  return formatNumber(threshold, true).toString();
}

function getHydratedAchievementName(templateName: string, threshold: number): string {
  const newName = templateName
    .replace('{threshold}', formatAchievementThreshold(templateName, threshold))
    .replace('{level}', formatAchievementThreshold(templateName, threshold));

  if (newName.startsWith('Base 99 Stats')) {
    return newName.replace('Base 99 Stats', 'Maxed Overall');
  }

  return newName;
}

export function getAchievementDefinitions(): AchievementDefinition[] {
  const definitions: AchievementDefinition[] = [];

  ACHIEVEMENT_TEMPLATES.forEach(({ thresholds, name, metric, measure, getCurrentValue }) => {
    const metricValueKey = getMetricValueKey(metric);

    thresholds.forEach(threshold => {
      const newName = getHydratedAchievementName(name, threshold);

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

function findAchievementActivationDates(pastSnapshots: Snapshot[], definitions: AchievementDefinition[]) {
  if (!definitions || definitions.length === 0) return {};

  // The player must have atleast 2 snapshots to find a achievement date
  if (!pastSnapshots || pastSnapshots.length < 2) return {};

  const dateMap: Record<string, { date: Date; accuracy: number }> = {};

  for (let i = 0; i < pastSnapshots.length - 1; i++) {
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

/**
 * Search for achievement crossing dates in a player's snapshot history, in batches.
 * Iterates from newest to oldest so that recent crossings resolve quickly.
 */
export async function findMissingAchievementDates(playerId: number, definitions: AchievementDefinition[]) {
  const dateMap: ReturnType<typeof findAchievementActivationDates> = {};

  const BATCH_SIZE = 500;
  let remainingDefs = [...definitions];

  for (let batchIndex = 0; remainingDefs.length > 0; batchIndex++) {
    // Overfetch by 1 so consecutive batches share a boundary snapshot,
    // allowing "findAchievementActivationDates" to detect crossings at batch edges.
    const batchSnapshots = await prisma.snapshot.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
      take: BATCH_SIZE + 1,
      skip: batchIndex * BATCH_SIZE
    });

    if (batchSnapshots.length === 0) {
      break;
    }

    const batchDates = findAchievementActivationDates([...batchSnapshots].reverse(), remainingDefs);
    Object.assign(dateMap, batchDates);

    // Remove resolved definitions
    remainingDefs = remainingDefs.filter(d => !(d.name in dateMap));

    if (batchSnapshots.length <= BATCH_SIZE) {
      break;
    }
  }

  return dateMap;
}
