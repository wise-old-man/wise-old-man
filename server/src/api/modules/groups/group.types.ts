import { Player } from '../../../types';

export interface GroupHiscoresSkillItem {
  type: 'skill';
  rank: number;
  level: number;
  experience: number;
}

export interface GroupHiscoresBossItem {
  type: 'boss';
  rank: number;
  kills: number;
}

export interface GroupHiscoresActivityItem {
  type: 'activity';
  rank: number;
  score: number;
}

export interface GroupHiscoresComputedMetricItem {
  type: 'computed';
  rank: number;
  value: number;
}

export interface GroupHiscoresEntry {
  player: Player;
  data:
    | GroupHiscoresSkillItem
    | GroupHiscoresBossItem
    | GroupHiscoresActivityItem
    | GroupHiscoresComputedMetricItem;
}
