import { Achievement, AchievementMeasure, Metric } from '../types';
import { MetricProps, SKILL_EXP_AT_99 } from './shared';

export function getAchievementMeasure(
  achievement: Pick<Achievement, 'metric' | 'threshold'>
): AchievementMeasure {
  if (achievement.metric === Metric.OVERALL && achievement.threshold <= SKILL_EXP_AT_99) {
    return 'levels';
  }

  return MetricProps[achievement.metric].measure;
}
