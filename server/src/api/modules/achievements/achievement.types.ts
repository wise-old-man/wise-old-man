import { Achievement, Metric, Player, Snapshot } from '../../../types';

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

interface ExtendedAchievementWithPlayer extends ExtendedAchievement {
  player: Player;
}

interface AchievementProgress extends Omit<ExtendedAchievement, 'createdAt'> {
  createdAt: Date | null;
  currentValue: number;
  absoluteProgress: number;
  relativeProgress: number;
}

export {
  AchievementDefinition,
  AchievementProgress,
  AchievementTemplate,
  ExtendedAchievement,
  ExtendedAchievementWithPlayer
};
