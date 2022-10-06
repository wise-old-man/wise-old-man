import { Skill, Boss, Activity, ComputedMetric, MapOf } from '../../../utils';
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
  ehp?: number;
}

export interface BossValue {
  metric: Boss;
  rank: number;
  kills: number;
  ehb?: number;
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
