import { calculateLevelDiff, calculateMetricDelta } from '../api/modules/deltas/delta.utils';
import { Metric, MetricDelta, Player, Snapshot } from '../types';
import { isSkill } from './shared';

export function calculateCompetitionDelta(
  metrics: Metric[],
  player: Player,
  startSnapshot: Snapshot,
  endSnapshot: Snapshot
) {
  const valuesSum: MetricDelta = { gained: 0, start: 0, end: 0 };
  const levelsSum: MetricDelta = { gained: 0, start: 0, end: 0 };

  for (const metric of metrics) {
    const valuesDiff = calculateMetricDelta(player, metric, startSnapshot, endSnapshot);

    valuesSum.end += Math.max(0, valuesDiff.end);
    valuesSum.start += Math.max(0, valuesDiff.start);
    valuesSum.gained += Math.max(0, valuesDiff.gained);

    if (isSkill(metric)) {
      const levelsDiff = calculateLevelDiff(metric, startSnapshot, endSnapshot, valuesDiff);

      levelsSum.end += Math.max(0, levelsDiff.end);
      levelsSum.start += Math.max(0, levelsDiff.start);
      levelsSum.gained += Math.max(0, levelsDiff.gained);
    }
  }

  // If was unranked in all metrics, set the total to -1
  if (valuesSum.start === 0) valuesSum.start = -1;
  if (valuesSum.end === 0) valuesSum.end = -1;
  if (levelsSum.start === 0) levelsSum.start = -1;
  if (levelsSum.end === 0) levelsSum.end = -1;

  return {
    valuesDiff: valuesSum,
    levelsDiff: levelsSum
  };
}
