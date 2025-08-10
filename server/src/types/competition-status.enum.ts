export enum CompetitionStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  FINISHED = 'finished'
}

export const COMPETITION_STATUSES = Object.values(CompetitionStatus) as CompetitionStatus[];
