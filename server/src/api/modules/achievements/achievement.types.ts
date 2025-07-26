import { Achievement, Player } from '../../../types';

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

export { AchievementProgress, ExtendedAchievement, ExtendedAchievementWithPlayer };
