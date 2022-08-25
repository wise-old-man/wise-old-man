import { NameChange } from '@prisma/client';
import { FormattedSnapshot } from '../snapshots/snapshot.types';

export { NameChangeStatus } from '../../../prisma/enum-adapter';

export type NameChangeDetails = {
  nameChange: NameChange;
  data?: {
    isNewOnHiscores: boolean;
    isOldOnHiscores: boolean;
    isNewTracked: boolean;
    hasNegativeGains: boolean;
    timeDiff: number;
    hoursDiff: number;
    ehpDiff: number;
    ehbDiff: number;
    oldStats: FormattedSnapshot;
    newStats: FormattedSnapshot;
  };
};

export { NameChange };
