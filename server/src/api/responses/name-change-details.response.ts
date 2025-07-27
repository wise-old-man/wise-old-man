/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Metric } from '../../types';
import { NameChangeResponse } from './name-change.response';
import { SnapshotResponse } from './snapshot.response';

export interface NameChangeDetailsResponse {
  nameChange: NameChangeResponse;
  data?: {
    isNewOnHiscores: boolean;
    isOldOnHiscores: boolean;
    isNewTracked: boolean;
    hasNegativeGains: boolean;
    negativeGains: Record<Metric, number> | null;
    timeDiff: number;
    hoursDiff: number;
    ehpDiff: number;
    ehbDiff: number;
    oldStats: SnapshotResponse;
    newStats: SnapshotResponse | null;
  };
}
