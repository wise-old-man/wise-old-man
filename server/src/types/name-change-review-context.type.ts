import { Metric } from './metric.enum';

export type NameChangeDenyContext =
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
      negativeGains: Record<Metric, number>;
    };

export type NameChangeSkipContext =
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

export type NameChangeReviewContext = NameChangeSkipContext | NameChangeDenyContext;
