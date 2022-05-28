import {
  getMetricMeasure,
  getMetricRankKey,
  getMetricValueKey,
  isBoss,
  isSkill,
  Metric,
  METRICS
} from '../../../utils/metrics';
import { Snapshot } from '../../../prisma';
import { ServerError } from '../../errors';
import * as efficiencyUtils from '../../modules/efficiency/efficiency.utils';

/**
 * Converts a Snapshot instance into a JSON friendlier format
 */
function format(snapshot: Snapshot, efficiency?: any) {
  if (!snapshot) return null;

  const obj = {
    createdAt: snapshot.createdAt,
    importedAt: snapshot.importedAt
  };

  METRICS.forEach(m => {
    obj[m] = {
      rank: snapshot[getMetricRankKey(m)],
      [getMetricMeasure(m)]: snapshot[getMetricValueKey(m)]
    };

    if (m === Metric.OVERALL) {
      obj[m].ehp = Math.max(0, snapshot.ehpValue);
    } else if (efficiency) {
      // Add individual ehp/ehb values
      if (isSkill(m)) {
        obj[m].ehp = efficiency[m];
      } else if (isBoss(m)) {
        obj[m].ehb = efficiency[m];
      }
    }
  });

  return obj;
}

/**
 * Decides whether two snapshots are within reasonable time/progress distance
 * of eachother. The difference between the two cannot be negative, or over the
 * EHP (maximum efficiency).
 */
function withinRange(before: Snapshot, after: Snapshot): boolean {
  // If this is the player's first snapshot
  if (!before) return true;

  if (!after) return false;

  const negativeGains = hasNegativeGains(before, after);
  const excessiveGains = hasExcessiveGains(before, after);

  return !negativeGains && !excessiveGains;
}

/**
 * Checks whether two snapshots have excessive gains in between.
 * This happens when the gained EHP and gained EHB combined are over
 * the ellapsed time between the two. This would have to mean this player
 * played at over maximum efficiency for the transition duration.
 */
function hasExcessiveGains(before: Snapshot, after: Snapshot): boolean {
  const afterDate = after.createdAt || new Date();
  const timeDiff = afterDate.getTime() - before.createdAt.getTime();

  const hoursDiff = Math.max(120, timeDiff / 1000 / 3600);

  const ehpDiff = efficiencyUtils.getPlayerEHP(after) - efficiencyUtils.getPlayerEHP(before);
  const ehbDiff = efficiencyUtils.getPlayerEHB(after) - efficiencyUtils.getPlayerEHB(before);

  return ehpDiff + ehbDiff > hoursDiff;
}

/**
 * Checks whether there has been gains between two snapshots
 */
function hasChanged(before: Snapshot, after: Snapshot): boolean {
  if (!before) return true;
  if (!after) return false;

  // EHP and EHB can fluctuate without the player's envolvement
  const keysToIgnore = ['ehpValue', 'ehbValue'];

  const isValidKey = key => !keysToIgnore.includes(key);
  const keys = METRICS.map(m => getMetricValueKey(m));

  return keys.some(k => isValidKey(k) && after[k] > -1 && after[k] > before[k]);
}

/**
 * Checks whether two snapshots have negative gains in between.
 */
function hasNegativeGains(before: Snapshot, after: Snapshot): boolean {
  // Last man standing scores, ehp and ehb can fluctuate overtime
  const keysToIgnore = ['last_man_standingScore', 'ehpValue', 'ehbValue'];

  const isValidKey = key => !keysToIgnore.includes(key);
  const keys = METRICS.map(m => getMetricValueKey(m));

  return keys.some(k => isValidKey(k) && after[k] > -1 && after[k] < before[k]);
}

function average(snapshots: Snapshot[]): Snapshot {
  if (!snapshots && snapshots.length === 0) {
    throw new ServerError('Invalid snapshots list. Failed to find average.');
  }

  const base: any = {
    id: -1,
    playerId: -1,
    createdAt: null,
    importedAt: null
  };

  METRICS.forEach(metric => {
    const valueKey = getMetricValueKey(metric);
    const rankKey = getMetricRankKey(metric);

    const valueSum = snapshots
      .map((s: Snapshot) => s[valueKey])
      .reduce((acc: number, cur: any) => acc + parseInt(cur), 0);

    const rankSum = snapshots
      .map((s: Snapshot) => s[rankKey])
      .reduce((acc: number, cur: any) => acc + parseInt(cur), 0);

    const valueAvg = Math.round(valueSum / snapshots.length);
    const rankAvg = Math.round(rankSum / snapshots.length);

    base[valueKey] = valueAvg;
    base[rankKey] = rankAvg;
  });

  return base;
}

export { format, average, hasChanged, hasExcessiveGains, hasNegativeGains, withinRange };
