import { Metric, isVirtualMetric } from '../../../utils';

// All records' values are stored as an Integer, but EHP/EHB records can have
// float values, so they're multiplied by 10,000 when saving to the database.
// Inversely, we need to divide any EHP/EHB records by 10,000 when fetching from the database.
export function prepareRecordValue(metric: Metric, value: number) {
  return isVirtualMetric(metric) ? Math.floor(value * 10_000) : value;
}
