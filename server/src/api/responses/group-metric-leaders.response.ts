/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Activity, Boss, ComputedMetric, Skill } from '../../types';
import { PlayerResponse } from './player.response';

export interface GroupMetricLeadersResponse {
  skills: Record<
    Skill,
    {
      player: PlayerResponse | null;
      metric: Skill;
      rank: number;
      level: number;
      experience: number;
    }
  >;
  bosses: Record<
    Boss,
    {
      player: PlayerResponse | null;
      metric: Boss;
      rank: number;
      kills: number;
    }
  >;
  activities: Record<
    Activity,
    {
      player: PlayerResponse | null;
      metric: Activity;
      rank: number;
      score: number;
    }
  >;
  computed: Record<
    ComputedMetric,
    {
      player: PlayerResponse | null;
      metric: ComputedMetric;
      rank: number;
      value: number;
    }
  >;
}
