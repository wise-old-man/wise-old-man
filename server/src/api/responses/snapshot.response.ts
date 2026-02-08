/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import {
  ACTIVITIES,
  Activity,
  Boss,
  BOSSES,
  COMPUTED_METRICS,
  ComputedMetric,
  Metric,
  Skill,
  SKILLS,
  Snapshot
} from '../../types';
import { getMetricRankKey } from '../../utils/get-metric-rank-key.util';
import { getMetricValueKey } from '../../utils/get-metric-value-key.util';
import { pick } from '../../utils/pick.util';
import { getLevel } from '../../utils/shared';
import { getTotalLevel } from '../modules/snapshots/snapshot.utils';

interface SkillData {
  metric: Skill;
  rank: number;
  level: number;
  experience: number;
  ehp: number;
}

interface BossData {
  metric: Boss;
  rank: number;
  kills: number;
  ehb: number;
}

interface ActivityData {
  metric: Activity;
  rank: number;
  score: number;
}

interface ComputeMetricData {
  metric: ComputedMetric;
  rank: number;
  value: number;
}

export interface SnapshotResponse {
  id: number;
  playerId: number;
  createdAt: Date;
  importedAt: Date | null;
  data: {
    skills: Record<Skill, SkillData>;
    bosses: Record<Boss, BossData>;
    activities: Record<Activity, ActivityData>;
    computed: Record<ComputedMetric, ComputeMetricData>;
  };
}

export function formatSnapshotResponse(
  snapshot: Snapshot,
  efficiencyMap: Map<Skill | Boss, number>
): SnapshotResponse {
  return {
    ...pick(snapshot, 'id', 'playerId', 'createdAt', 'importedAt'),
    data: {
      skills: Object.fromEntries(
        SKILLS.map(s => {
          const experience = snapshot[getMetricValueKey(s)];

          return [
            s,
            {
              metric: s,
              experience,
              rank: snapshot[getMetricRankKey(s)],
              level: s === Metric.OVERALL ? getTotalLevel(snapshot) : getLevel(experience),
              ehp: efficiencyMap.get(s) || 0
            }
          ];
        })
      ) as Record<Skill, SkillData>,
      bosses: Object.fromEntries(
        BOSSES.map(b => {
          return [
            b,
            {
              metric: b,
              kills: snapshot[getMetricValueKey(b)],
              rank: snapshot[getMetricRankKey(b)],
              ehb: efficiencyMap.get(b) || 0
            }
          ];
        })
      ) as Record<Boss, BossData>,
      activities: Object.fromEntries(
        ACTIVITIES.map(a => {
          return [
            a,
            {
              metric: a,
              score: snapshot[getMetricValueKey(a)],
              rank: snapshot[getMetricRankKey(a)]
            }
          ];
        })
      ) as Record<Activity, ActivityData>,
      computed: Object.fromEntries(
        COMPUTED_METRICS.map(v => {
          return [
            v,
            {
              metric: v,
              value: snapshot[getMetricValueKey(v)],
              rank: snapshot[getMetricRankKey(v)]
            }
          ];
        })
      ) as Record<ComputedMetric, ComputeMetricData>
    }
  };
}
