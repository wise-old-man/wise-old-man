import { MapOf } from '../types';

export enum CompetitionType {
  CLASSIC = 'classic',
  TEAM = 'team'
}

export const CompetitionTypeProps: MapOf<CompetitionType, { name: string }> = {
  [CompetitionType.CLASSIC]: { name: 'Classic' },
  [CompetitionType.TEAM]: { name: 'Team' }
};

export enum CompetitionStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  FINISHED = 'finished'
}

export const CompetitionStatusProps: MapOf<CompetitionStatus, { name: string }> = {
  [CompetitionStatus.UPCOMING]: { name: 'Upcoming' },
  [CompetitionStatus.ONGOING]: { name: 'Ongoing' },
  [CompetitionStatus.FINISHED]: { name: 'Finished' }
};

export const COMPETITION_TYPES = Object.values(CompetitionType);
export const COMPETITION_STATUSES = Object.values(CompetitionStatus);
