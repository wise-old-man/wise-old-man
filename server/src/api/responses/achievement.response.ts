/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Achievement, AchievementMeasure } from '../../types';
import { getAchievementMeasure } from '../../utils/get-achievement-measure.util';
import { pick } from '../../utils/pick.util';
import { LEGACY_TEMPLATE_NAMES } from '../modules/achievements/achievement.templates';

export interface AchievementResponse extends Achievement {
  measure: AchievementMeasure;
  legacy: boolean;
}

export function formatAchievementResponse(achievement: Achievement): AchievementResponse {
  return {
    ...pick(achievement, 'playerId', 'name', 'metric', 'threshold', 'accuracy', 'createdAt'),
    measure: getAchievementMeasure(achievement),
    legacy: LEGACY_TEMPLATE_NAMES.includes(achievement.name)
  };
}
