import { Metric } from './metric.enum';

export interface CompetitionMetric {
  competitionId: number;
  metric: Metric;
  createdAt: Date;
  deletedAt: Date | null;
}
