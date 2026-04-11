export const CompetitionTimeEventType = {
  AFTER_START: 'after_start',
  BEFORE_START: 'before_start',
  BEFORE_END: 'before_end',
  DURING: 'during'
} as const;

export type CompetitionTimeEventType =
  (typeof CompetitionTimeEventType)[keyof typeof CompetitionTimeEventType];
