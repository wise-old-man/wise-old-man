import { BOSSES, Metric, SKILLS, Snapshot } from '../types';
import { getMetricValueKey } from './get-metric-value-key.util';

/**
 * To reduce number of columns returned from our snapshot queries,
 * we can calculate which fields are required based on the metric.
 *
 * Most metrics only require their own value, but some metrics require
 * other metrics to be calculated. For example, Overall and EHP requires all skills.
 *
 * "playerId" and "createdAt" are always included, callers rely on them to map
 * snapshots back to their players, and to read the snapshot's date.
 */
export function getRequiredSnapshotFields(metrics: Metric[]) {
  const fields: ['playerId', 'createdAt'] & Array<keyof Snapshot> = ['playerId', 'createdAt'];

  for (const metric of metrics) {
    if (metric === Metric.OVERALL || metric === Metric.EHP) {
      SKILLS.forEach(skill => {
        fields.push(getMetricValueKey(skill));
      });
    } else if (metric === Metric.EHB) {
      BOSSES.forEach(boss => {
        fields.push(getMetricValueKey(boss));
      });
    } else {
      fields.push(getMetricValueKey(metric));
    }
  }

  return Array.from(new Set(fields)); // dedupe
}

/**
 * Same as "getRequiredSnapshotFields", but shaped as a Prisma "select" object.
 */
export function selectRequiredSnapshotFields(metrics: Metric[]) {
  const map: { playerId: true; createdAt: true } & Partial<Record<keyof Snapshot, true>> = {
    playerId: true,
    createdAt: true
  };

  const requiredFields = getRequiredSnapshotFields(metrics);

  for (const field of requiredFields) {
    map[field] = true;
  }

  return map;
}
