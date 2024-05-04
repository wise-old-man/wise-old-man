import { Activity, Boss, Player, Skill, ComputedMetric, MapOf } from '../../../utils';

export interface MeasuredDeltaProgress {
  start: number;
  end: number;
  gained: number;
}

export interface SkillDelta {
  metric: Skill;
  ehp: MeasuredDeltaProgress;
  rank: MeasuredDeltaProgress;
  level: MeasuredDeltaProgress;
  experience: MeasuredDeltaProgress;
}

export interface BossDelta {
  metric: Boss;
  ehb: MeasuredDeltaProgress;
  rank: MeasuredDeltaProgress;
  kills: MeasuredDeltaProgress;
}

export interface ActivityDelta {
  metric: Activity;
  rank: MeasuredDeltaProgress;
  score: MeasuredDeltaProgress;
}

export interface ComputedMetricDelta {
  metric: ComputedMetric;
  rank: MeasuredDeltaProgress;
  value: MeasuredDeltaProgress;
}

export interface PlayerDeltasMap {
  skills: MapOf<Skill, SkillDelta>;
  bosses: MapOf<Boss, BossDelta>;
  activities: MapOf<Activity, ActivityDelta>;
  computed: MapOf<ComputedMetric, ComputedMetricDelta>;
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
  data: {
    start: number;
    end: number;
    gained: number;
  };
}
