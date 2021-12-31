enum CompetitionType {
  CLASSIC = 'classic',
  TEAM = 'team'
}

enum CompetitionStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  FINISHED = 'finished'
}

const CompetitionTypeProps = {
  [CompetitionType.CLASSIC]: { name: 'Classic' },
  [CompetitionType.TEAM]: { name: 'Team' }
};

const CompetitionStatusProps = {
  [CompetitionStatus.UPCOMING]: { name: 'Upcoming' },
  [CompetitionStatus.ONGOING]: { name: 'Ongoing' },
  [CompetitionStatus.FINISHED]: { name: 'Finished' }
};

const COMPETITION_TYPES = Object.values(CompetitionType);
const COMPETITION_STATUSES = Object.values(CompetitionStatus);

function findCompetitionType(typeName: string): CompetitionType | null {
  for (var [key, value] of Object.entries(CompetitionTypeProps)) {
    if (value.name === typeName) return key as CompetitionType;
  }

  return null;
}

function findCompetitionStatus(statusName: string): CompetitionStatus | null {
  for (var [key, value] of Object.entries(CompetitionStatusProps)) {
    if (value.name === statusName) return key as CompetitionStatus;
  }

  return null;
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
  findCompetitionType,
  findCompetitionStatus
};
