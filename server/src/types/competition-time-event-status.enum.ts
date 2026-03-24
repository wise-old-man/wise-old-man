export const CompetitionTimeEventStatus = {
  WAITING: 'waiting',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELED: 'canceled'
} as const;

export type CompetitionTimeEventStatus =
  (typeof CompetitionTimeEventStatus)[keyof typeof CompetitionTimeEventStatus];
