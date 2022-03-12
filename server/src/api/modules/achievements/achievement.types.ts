import { Achievement } from '../../../prisma';
import { Snapshot } from '../../../database/models';

interface AchievementTemplate {
  name: string;
  metric: string;
  measure: string;
  thresholds: number[];
  getCurrentValue?: (snapshot: Snapshot, threshold: number) => number;
}

interface AchievementDefinition {
  name: string;
  metric: string;
  measure: string;
  threshold: number;
  validate: (snapshot: Snapshot) => boolean;
  getCurrentValue: (snapshot: Snapshot) => number;
}

interface ExtendedAchievement extends Achievement {
  measure: string;
}

interface ProgressAchievement extends ExtendedAchievement {
  currentValue: number;
  absoluteProgress: number;
  relativeProgress: number;
}

export { ExtendedAchievement, ProgressAchievement, AchievementDefinition, AchievementTemplate };
