import { ActivityEnum, BossEnum, SkillEnum, VirtualEnum } from '../../../prisma';

export interface MeasuredDeltaProgress {
  start: number;
  end: number;
  gained: number;
}

export interface SkillDelta {
  metric: SkillEnum;
  ehp: MeasuredDeltaProgress;
  rank: MeasuredDeltaProgress;
  level: MeasuredDeltaProgress;
  experience: MeasuredDeltaProgress;
}

export interface BossDelta {
  metric: BossEnum;
  ehb: MeasuredDeltaProgress;
  rank: MeasuredDeltaProgress;
  kills: MeasuredDeltaProgress;
}

export interface ActivityDelta {
  metric: ActivityEnum;
  rank: MeasuredDeltaProgress;
  score: MeasuredDeltaProgress;
}

export interface VirtualDelta {
  metric: VirtualEnum;
  rank: MeasuredDeltaProgress;
  value: MeasuredDeltaProgress;
}

export interface PlayerDeltasArray {
  skills: Array<SkillDelta>;
  bosses: Array<BossDelta>;
  activities: Array<ActivityDelta>;
  virtuals: Array<VirtualDelta>;
}

export interface PlayerDeltasMap {
  skills: {
    [skill in SkillEnum]?: SkillDelta;
  };
  bosses: {
    [boss in BossEnum]?: BossDelta;
  };
  activities: {
    [activity in ActivityEnum]?: ActivityDelta;
  };
  virtuals: {
    [virtual in VirtualEnum]?: VirtualDelta;
  };
}
