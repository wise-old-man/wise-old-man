import { Metric } from './metric.enum';

export interface TrendDatapoint {
  date: Date;
  metric: Metric;
  sum: number;
  maxValue: number;
  minValue: number;
  maxRank: number;
}
