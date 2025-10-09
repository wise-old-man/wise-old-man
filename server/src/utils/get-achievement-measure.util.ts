import { Achievement, AchievementMeasure, Metric } from '../types';
import { getExpForLevel, MetricProps, REAL_SKILLS } from './shared';

export function getAchievementMeasure(
  achievement: Pick<Achievement, 'metric' | 'threshold'>
): AchievementMeasure {
  if (
    achievement.metric === Metric.OVERALL &&
    [
      getExpForLevel(60) * REAL_SKILLS.length,
      getExpForLevel(70) * REAL_SKILLS.length,
      getExpForLevel(80) * REAL_SKILLS.length,
      getExpForLevel(90) * REAL_SKILLS.length,
      getExpForLevel(99) * REAL_SKILLS.length
    ].includes(achievement.threshold)
  ) {
    return 'levels';
  }

  return MetricProps[achievement.metric].measure;
}
