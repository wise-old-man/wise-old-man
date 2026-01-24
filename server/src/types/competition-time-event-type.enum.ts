export const CompetitionTimeEventType = {
  BEFORE_START: 'before_start',
  BEFORE_END: 'before_end',
  DURING: 'during'
} as const;

export type CompetitionTimeEventType =
  (typeof CompetitionTimeEventType)[keyof typeof CompetitionTimeEventType];
