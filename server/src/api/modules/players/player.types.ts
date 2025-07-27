import { FormattedSnapshot } from '../snapshots/snapshot.types';

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
