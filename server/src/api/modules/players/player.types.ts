import { Player, PlayerArchive } from '../../../prisma';
import { FormattedSnapshot } from '../snapshots/snapshot.types';

export interface PlayerDetails extends Player {
  combatLevel: number;
  archive: PlayerArchive | null;
  latestSnapshot: FormattedSnapshot | null;
}

export interface FlaggedPlayerReviewContext {
  previous: FormattedSnapshot;
  rejected: FormattedSnapshot;
  negativeGains: boolean;
  excessiveGains: boolean;
  possibleRollback: boolean;
  excessiveGainsReversed: boolean;
  data: {
    stackableGainedRatio: number;
    previousEHP: number;
    previousEHB: number;
    previousRank: number;
    rejectedEHP: number;
    rejectedEHB: number;
    rejectedRank: number;
  };
}

export type PlayerArchiveWithPlayer = PlayerArchive & {
  player: Player;
};

export { Player };
