/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { SnapshotResponse } from './snapshot.response';

export interface FlaggedPlayerReviewContextResponse {
  previous: SnapshotResponse;
  rejected: SnapshotResponse;
  hasNegativeGains: boolean;
  hasExcessiveGains: boolean;
  hasExcessiveGainsReversed: boolean;
  isPossibleRollback: boolean;
  rollbackContext: {
    earliestMatchDate: Date;
    latestMatchDate: Date;
    totalMatches: number;
  } | null;
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
