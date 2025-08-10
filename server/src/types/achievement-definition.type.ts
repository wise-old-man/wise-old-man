import { Metric } from './metric.enum';
import { Snapshot } from './snapshot.type';

export interface AchievementDefinition {
  name: string;
  metric: Metric;
  measure: string;
  threshold: number;
  validate: (snapshot: Snapshot) => boolean;
  getCurrentValue: (snapshot: Snapshot) => number;
}
