import { CompetitionStatus } from '../../types';

export const CompetitionStatusProps: Record<CompetitionStatus, { name: string }> = {
  [CompetitionStatus.UPCOMING]: { name: 'Upcoming' },
  [CompetitionStatus.ONGOING]: { name: 'Ongoing' },
  [CompetitionStatus.FINISHED]: { name: 'Finished' }
};
