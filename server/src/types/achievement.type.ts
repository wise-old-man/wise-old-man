import { Metric } from './metric.enum';

export interface Achievement {
  playerId: number;
  name: string;
  metric: Metric;
  threshold: number;
  accuracy: number | null;
  createdAt: Date;
}
