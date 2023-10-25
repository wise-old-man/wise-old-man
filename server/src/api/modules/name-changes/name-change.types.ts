import { NameChange } from '../../../prisma';
import { MapOf, Metric, Player } from '../../../utils';
import { FormattedSnapshot } from '../snapshots/snapshot.types';

export { NameChangeStatus } from '../../../prisma/enum-adapter';

export type DenyContext =
  | {
      reason: 'manual_review';
    }
  | {
      reason: 'old_stats_cannot_be_found';
    }
  | {
      reason: 'new_name_not_on_the_hiscores';
    }
  | {
      reason: 'negative_gains';
      negativeGains: MapOf<Metric, number>;
    };

export type SkipContext =
  | {
      reason: 'transition_period_too_long';
      maxHoursDiff: number;
      hoursDiff: number;
    }
  | {
      reason: 'excessive_gains';
      ehpDiff: number;
      ehbDiff: number;
      hoursDiff: number;
    }
  | {
      reason: 'total_level_too_low';
      minTotalLevel: number;
      totalLevel: number;
    };

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
    newStats: FormattedSnapshot;
  };
};

export type NameChangeWithPlayer = NameChange & {
  player: Player;
};

export { NameChange };
