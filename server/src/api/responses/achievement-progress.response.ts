/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Achievement } from '../../types';
import { getAchievementMeasure } from '../../utils/get-achievement-measure.util';
import { LEGACY_TEMPLATE_NAMES } from '../modules/achievements/achievement.templates';
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
    legacy: LEGACY_TEMPLATE_NAMES.includes(achievement.name),
    createdAt,
    currentValue,
    absoluteProgress,
    relativeProgress
  };
}
