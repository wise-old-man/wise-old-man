export const Period = {
  FIVE_MIN: 'five_min',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
} as const;

export type Period = (typeof Period)[keyof typeof Period];

export const PERIODS = Object.values(Period);
