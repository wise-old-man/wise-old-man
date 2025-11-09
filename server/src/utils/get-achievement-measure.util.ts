import { Achievement, AchievementMeasure, Metric } from '../types';
import { MetricProps } from './shared';

export function getAchievementMeasure({
  name,
  metric
}: Pick<Achievement, 'name' | 'metric'>): AchievementMeasure {
  if (
    metric === Metric.OVERALL &&
    (name.includes('Maxed Overall') || new RegExp(/Base (60|70|80|90) Stats/).test(name))
  ) {
    return 'levels';
  }

  return MetricProps[metric].measure;
}
