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
