import {
  BOSSES,
  getMetricRankKey,
  getMetricValueKey,
  getTotalLevel,
  Metric,
  METRICS,
  VIRTUALS,
  ACTIVITIES,
  getLevel,
  SKILLS
} from '../../../utils';
import { Snapshot } from '../../../prisma';
import { ServerError } from '../../errors';
import * as efficiencyUtils from '../../modules/efficiency/efficiency.utils';
import { EfficiencyMap } from '../efficiency/efficiency.types';
import { BossValue, FormattedSnapshot, SkillValue } from './snapshot.types';

function format(snapshot: Snapshot, efficiencyMap?: EfficiencyMap): FormattedSnapshot {
  if (!snapshot) return null;

  const { id, playerId, createdAt, importedAt } = snapshot;

  return {
    id,
    playerId,
    createdAt,
    importedAt,
    data: {
      skills: Object.fromEntries(
        SKILLS.map(s => {
          const experience = snapshot[getMetricValueKey(s)];

          const value: SkillValue = {
            metric: s,
            experience,
            rank: snapshot[getMetricRankKey(s)],
            level: s === Metric.OVERALL ? getTotalLevel(snapshot) : getLevel(experience)
          };

          if (efficiencyMap) {
            if (s === Metric.OVERALL) {
              value.ehp = snapshot.ehpValue;
            } else if (efficiencyMap[s] !== undefined) {
              value.ehp = efficiencyMap[s];
            }
          }

          return [s, value];
        })
      ),
      bosses: Object.fromEntries(
        BOSSES.map(b => {
          const value: BossValue = {
            metric: b,
            kills: snapshot[getMetricValueKey(b)],
            rank: snapshot[getMetricRankKey(b)]
          };

          if (efficiencyMap && efficiencyMap[b] !== undefined) {
            value.ehb = efficiencyMap[b];
          }

          return [b, value];
        })
      ),
      activities: Object.fromEntries(
        ACTIVITIES.map(a => {
          return [
            a,
            {
              metric: a,
              score: snapshot[getMetricValueKey(a)],
              rank: snapshot[getMetricRankKey(a)]
            }
          ];
        })
      ),
      virtuals: Object.fromEntries(
        VIRTUALS.map(v => {
          return [
            v,
            {
              metric: v,
              value: snapshot[getMetricValueKey(v)],
              rank: snapshot[getMetricRankKey(v)]
            }
          ];
        })
      )
    }
  };
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
