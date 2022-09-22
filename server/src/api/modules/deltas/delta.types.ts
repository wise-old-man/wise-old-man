import { Activity, Boss, Player, Skill, ComputedMetric } from '../../../utils';

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

export interface PlayerDeltasArray {
  skills: Array<SkillDelta>;
  bosses: Array<BossDelta>;
  activities: Array<ActivityDelta>;
  computed: Array<ComputedMetricDelta>;
}

export interface PlayerDeltasMap {
  skills: {
    [skill in Skill]?: SkillDelta;
  };
  bosses: {
    [boss in Boss]?: BossDelta;
  };
  activities: {
    [activity in Activity]?: ActivityDelta;
  };
  computed: {
    [computedMetric in ComputedMetric]?: ComputedMetricDelta;
  };
}

export interface DeltaLeaderboardEntry {
  player: Player;
  playerId: number;
  startDate: Date;
  endDate: Date;
  gained: number;
}
