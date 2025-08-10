import { Metric } from './metric.enum';
import { Period } from './period.enum';

export interface Record {
  playerId: number;
  period: Period;
  metric: Metric;
  value: number;
  updatedAt: Date;
}
