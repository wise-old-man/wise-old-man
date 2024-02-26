import { Skill, Boss, Activity, ComputedMetric, MapOf, Player } from '../../../utils';
import { Snapshot } from '../../../prisma';

export type SnapshotFragment = Omit<Snapshot, 'id'>;

export enum SnapshotDataSource {
  HISCORES,
  CRYSTAL_MATH_LABS
}

export interface SkillValue {
  metric: Skill;
  rank: number;
  level: number;
  experience: number;
  ehp: number;
}

export interface BossValue {
  metric: Boss;
  rank: number;
  kills: number;
  ehb: number;
}

export interface ActivityValue {
  metric: Activity;
  rank: number;
  score: number;
}

export interface ComputedMetricValue {
  metric: ComputedMetric;
  rank: number;
  value: number;
}

export interface MetricLeaders {
  skills: MapOf<Skill, SkillValue & { player: Player | null }>;
  bosses: MapOf<Boss, BossValue & { player: Player | null }>;
  activities: MapOf<Activity, ActivityValue & { player: Player | null }>;
  computed: MapOf<ComputedMetric, ComputedMetricValue & { player: Player | null }>;
}

export interface FormattedSnapshot {
  id: number;
  playerId: number;
  createdAt: Date;
  importedAt: Date | null;
  data: {
    skills: MapOf<Skill, SkillValue>;
    bosses: MapOf<Boss, BossValue>;
    activities: MapOf<Activity, ActivityValue>;
    computed: MapOf<ComputedMetric, ComputedMetricValue>;
  };
}

export { Snapshot };
