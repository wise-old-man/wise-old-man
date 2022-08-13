import { Skill, Boss, Activity, Virtual } from '../../../utils';
import { PrismaTypes } from '../../../prisma';

export type SnapshotFragment = PrismaTypes.XOR<
  PrismaTypes.SnapshotCreateInput,
  PrismaTypes.SnapshotUncheckedCreateInput
> & { playerId: number };

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

export interface VirtualValue {
  metric: Virtual;
  rank: number;
  value: number;
}

export interface FormattedSnapshot {
  id: number;
  playerId: number;
  createdAt: Date;
  importedAt: Date | null;
  data: {
    skills: {
      [skill in Skill]?: SkillValue;
    };
    bosses: {
      [boss in Boss]?: BossValue;
    };
    activities: {
      [activity in Activity]?: ActivityValue;
    };
    virtuals: {
      [virtual in Virtual]?: VirtualValue;
    };
  };
}
