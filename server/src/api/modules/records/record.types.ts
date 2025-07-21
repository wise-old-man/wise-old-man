import { Player, Record } from '../../../types';

export type RecordLeaderboardEntry = Record & {
  player: Player;
};
