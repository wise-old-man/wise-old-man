import { CompetitionType } from '../prisma/enum-adapter';
import { MapOf } from './types';

enum CompetitionStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  FINISHED = 'finished'
}

const CompetitionTypeProps: MapOf<CompetitionType, { name: string }> = {
  [CompetitionType.CLASSIC]: { name: 'Classic' },
  [CompetitionType.TEAM]: { name: 'Team' }
};

const CompetitionStatusProps: MapOf<CompetitionStatus, { name: string }> = {
  [CompetitionStatus.UPCOMING]: { name: 'Upcoming' },
  [CompetitionStatus.ONGOING]: { name: 'Ongoing' },
  [CompetitionStatus.FINISHED]: { name: 'Finished' }
};

const COMPETITION_TYPES = Object.values(CompetitionType);
const COMPETITION_STATUSES = Object.values(CompetitionStatus);

function isCompetitionType(typeString: string): typeString is CompetitionType {
  return typeString in CompetitionTypeProps;
}

function isCompetitionStatus(statusString: string): statusString is CompetitionStatus {
  return statusString in CompetitionStatusProps;
}

export {
  // Enums
  CompetitionType,
  CompetitionStatus,
  CompetitionTypeProps,
  CompetitionStatusProps,
  // Lists
  COMPETITION_TYPES,
  COMPETITION_STATUSES,
  // Functions
  isCompetitionType,
  isCompetitionStatus
};
