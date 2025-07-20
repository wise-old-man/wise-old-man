import { Metric } from '../types';

export function getMetricRankKey<T extends Metric>(metric: T): `${T}Rank` {
  return `${metric}Rank`;
}
