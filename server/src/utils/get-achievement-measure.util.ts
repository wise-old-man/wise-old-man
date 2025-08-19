import { Achievement, AchievementMeasure, Metric } from '../types';
import { MetricProps } from './shared';

export function getAchievementMeasure(
  achievement: Pick<Achievement, 'metric' | 'threshold'>
): AchievementMeasure {
  if (
    achievement.metric === Metric.OVERALL &&
    [273_742, 737_627, 1_986_068, 5_346_332, 13_034_431].includes(achievement.threshold)
  ) {
    return 'levels';
  }

  return MetricProps[achievement.metric].measure;
}
