import { Metric } from './metric.enum';
import { Period } from './period.enum';

export interface CachedDelta {
  playerId: number;
  period: Period;
  metric: Metric;
  value: number;
  startedAt: Date;
  endedAt: Date;
  updatedAt: Date;
}
