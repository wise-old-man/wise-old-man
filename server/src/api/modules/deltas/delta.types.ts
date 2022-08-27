import { Activity, Boss, Player, Skill, Virtual } from '../../../utils';

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

export interface VirtualDelta {
  metric: Virtual;
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
    [skill in Skill]?: SkillDelta;
  };
  bosses: {
    [boss in Boss]?: BossDelta;
  };
  activities: {
    [activity in Activity]?: ActivityDelta;
  };
  virtuals: {
    [virtual in Virtual]?: VirtualDelta;
  };
}

export interface GroupDelta {
  player: Player;
  startDate: Date;
  endDate: Date;
  data: MeasuredDeltaProgress;
}

export { Delta } from '../../../prisma';
