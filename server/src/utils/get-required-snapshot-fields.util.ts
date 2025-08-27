import { BOSSES, Metric, SKILLS, Snapshot } from '../types';
import { getMetricValueKey } from './get-metric-value-key.util';

/**
 * To reduce number of columns returned from our snapshot queries,
 * we can calculate which fields are required based on the metric.
 *
 * Most metrics only require their own value, but some metrics require
 * other metrics to be calculated. For example, Overall and EHP requires all skills.
 */
export function getRequiredSnapshotFields(metrics: Metric[]): Partial<Record<keyof Snapshot, true>> {
  const requiredSnapshotFields: Partial<Record<keyof Snapshot, true>> = {};

  for (const metric of metrics) {
    if (metric === Metric.OVERALL || metric === Metric.EHP) {
      SKILLS.forEach(skill => {
        requiredSnapshotFields[getMetricValueKey(skill)] = true;
      });
    } else if (metric === Metric.EHB) {
      BOSSES.forEach(boss => {
        requiredSnapshotFields[getMetricValueKey(boss)] = true;
      });
    } else {
      requiredSnapshotFields[getMetricValueKey(metric)] = true;
    }
  }

  return requiredSnapshotFields;
}
