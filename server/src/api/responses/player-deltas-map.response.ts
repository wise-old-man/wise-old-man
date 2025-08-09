import { Activity, Boss, ComputedMetric, Skill } from '../../types';
import { MetricDelta } from '../../types/metric-delta.type';

export interface PlayerDeltasMapResponse {
  skills: Record<
    Skill,
    {
      metric: Skill;
      ehp: MetricDelta;
      rank: MetricDelta;
      level: MetricDelta;
      experience: MetricDelta;
    }
  >;
  bosses: Record<
    Boss,
    {
      metric: Boss;
      ehb: MetricDelta;
      rank: MetricDelta;
      kills: MetricDelta;
    }
  >;
  activities: Record<
    Activity,
    {
      metric: Activity;
      rank: MetricDelta;
      score: MetricDelta;
    }
  >;
  computed: Record<
    ComputedMetric,
    {
      metric: ComputedMetric;
      rank: MetricDelta;
      value: MetricDelta;
    }
  >;
}
