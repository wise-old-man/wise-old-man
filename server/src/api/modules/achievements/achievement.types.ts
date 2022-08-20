import { Metric } from '../../../utils';
import { Achievement, Snapshot } from '../../../prisma';

interface AchievementTemplate {
  name: string;
  metric: Metric;
  measure?: string;
  thresholds: number[];
  getCurrentValue?: (snapshot: Snapshot, threshold: number) => number;
}

interface AchievementDefinition {
  name: string;
  metric: Metric;
  measure: string;
  threshold: number;
  validate: (snapshot: Snapshot) => boolean;
  getCurrentValue: (snapshot: Snapshot) => number;
}

interface ExtendedAchievement extends Achievement {
  measure: string;
}

interface AchievementProgress extends ExtendedAchievement {
  currentValue: number;
  absoluteProgress: number;
  relativeProgress: number;
}

export { ExtendedAchievement, AchievementProgress, AchievementDefinition, AchievementTemplate };
