/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Activity, Boss, ComputedMetric, Skill } from '../../types';
import { PlayerResponse } from './player.response';

interface SkillLeader {
  player: PlayerResponse | null;
  metric: Skill;
  rank: number;
  level: number;
  experience: number;
}

interface BossLeader {
  player: PlayerResponse | null;
  metric: Boss;
  rank: number;
  kills: number;
}

interface ActivityLeader {
  player: PlayerResponse | null;
  metric: Activity;
  rank: number;
  score: number;
}

interface ComputeMetricLeader {
  player: PlayerResponse | null;
  metric: ComputedMetric;
  rank: number;
  value: number;
}

export interface GroupMetricLeadersResponse {
  skills: Record<Skill, SkillLeader>;
  bosses: Record<Boss, BossLeader>;
  activities: Record<Activity, ActivityLeader>;
  computed: Record<ComputedMetric, ComputeMetricLeader>;
}
