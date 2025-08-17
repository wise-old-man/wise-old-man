import { Metric } from '../types';
import { isComputedMetric } from './shared';

// All cached deltas/records' values are stored as an Integer, but EHP/EHB values are floats,
// so they're multiplied by 10,000 when saving to the database.
// Inversely, we need to divide any EHP/EHB values by 10,000 when fetching from the database.
export function prepareDecimalValue(metric: Metric, value: number) {
  return isComputedMetric(metric) ? Math.floor(value * 10_000) : value;
}
