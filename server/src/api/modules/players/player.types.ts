import { Player } from '../../../prisma';
import { FormattedSnapshot } from '../snapshots/snapshot.types';

export interface PlayerDetails extends Player {
  combatLevel: number;
  latestSnapshot: FormattedSnapshot;
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

export { Player };
