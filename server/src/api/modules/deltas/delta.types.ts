import { Activity, Boss, ComputedMetric, Player, Skill } from '../../../types';
import { MetricDelta } from '../../../types/metric-delta.type';

export interface SkillDelta {
  metric: Skill;
  ehp: MetricDelta;
  rank: MetricDelta;
  level: MetricDelta;
  experience: MetricDelta;
}

export interface BossDelta {
  metric: Boss;
  ehb: MetricDelta;
  rank: MetricDelta;
  kills: MetricDelta;
}

export interface ActivityDelta {
  metric: Activity;
  rank: MetricDelta;
  score: MetricDelta;
}

export interface ComputedMetricDelta {
  metric: ComputedMetric;
  rank: MetricDelta;
  value: MetricDelta;
}

export interface PlayerDeltasMap {
  skills: Record<Skill, SkillDelta>;
  bosses: Record<Boss, BossDelta>;
  activities: Record<Activity, ActivityDelta>;
  computed: Record<ComputedMetric, ComputedMetricDelta>;
}

export interface DeltaLeaderboardEntry {
  player: Player;
  playerId: number;
  startDate: Date;
  endDate: Date;
  gained: number;
}

export interface DeltaGroupLeaderboardEntry {
  player: Player;
  startDate: Date;
  endDate: Date;
  data: MetricDelta;
}
