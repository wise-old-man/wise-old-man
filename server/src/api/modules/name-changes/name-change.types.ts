import { Metric, NameChange, Player } from '../../../types';
import { MapOf } from '../../../utils';
import { FormattedSnapshot } from '../snapshots/snapshot.types';
export { NameChangeStatus } from '../../../types';

export type NameChangeDetails = {
  nameChange: NameChange;
  data?: {
    isNewOnHiscores: boolean;
    isOldOnHiscores: boolean;
    isNewTracked: boolean;
    hasNegativeGains: boolean;
    negativeGains: MapOf<Metric, number> | null;
    timeDiff: number;
    hoursDiff: number;
    ehpDiff: number;
    ehbDiff: number;
    oldStats: FormattedSnapshot;
    newStats: FormattedSnapshot | null;
  };
};

export type NameChangeWithPlayer = NameChange & {
  player: Player;
};
