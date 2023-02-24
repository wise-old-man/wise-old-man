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
  ehp?: number;
}

export interface SkillValueWithPlayer extends SkillValue {
  player: Player;
}

export interface BossValue {
  metric: Boss;
  rank: number;
  kills: number;
  ehb?: number;
}

export interface BossValueWithPlayer extends BossValue {
  player: Player;
}

export interface ActivityValue {
  metric: Activity;
  rank: number;
  score: number;
}

export interface ActivityValueWithPlayer extends ActivityValue {
  player: Player;
}

export interface ComputedMetricValue {
  metric: ComputedMetric;
  rank: number;
  value: number;
}

export interface ComputedMetricValueWithPlayer extends ComputedMetricValue {
  player: Player;
}

export interface BestGroupSnapshot {
  skills: MapOf<Skill, SkillValueWithPlayer>;
  bosses: MapOf<Boss, BossValueWithPlayer>;
  activities: MapOf<Activity, ActivityValueWithPlayer>;
  computed: MapOf<ComputedMetric, ComputedMetricValueWithPlayer>;
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
