import { Achievement } from '../../types';
import { getAchievementMeasure } from '../../utils/get-achievement-measure.util';
import { AchievementResponse } from './achievement.response';

export interface AchievementProgressResponse extends Omit<AchievementResponse, 'createdAt'> {
  createdAt: Date | null;
  currentValue: number;
  absoluteProgress: number;
  relativeProgress: number;
}

export function formatAchievementProgressResponse({
  achievement,
  createdAt,
  currentValue,
  absoluteProgress,
  relativeProgress
}: {
  achievement: Omit<Achievement, 'createdAt'>;
  createdAt: Date | null;
  currentValue: number;
  absoluteProgress: number;
  relativeProgress: number;
}): AchievementProgressResponse {
  return {
    ...achievement,
    measure: getAchievementMeasure(achievement),
    createdAt,
    currentValue,
    absoluteProgress,
    relativeProgress
  };
}
