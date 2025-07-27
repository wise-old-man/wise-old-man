import { Achievement, AchievementMeasure } from '../../types';
import { getAchievementMeasure } from '../../utils/get-achievement-measure.util';
import { pick } from '../../utils/pick.util';

export interface AchievementResponse extends Achievement {
  measure: AchievementMeasure;
}

export function formatAchievementResponse(achievement: Achievement): AchievementResponse {
  return {
    ...pick(achievement, 'playerId', 'name', 'metric', 'threshold', 'accuracy', 'createdAt'),
    measure: getAchievementMeasure(achievement)
  };
}
