import { CompetitionStatus } from '../../types/competition-status.enum';
import { MapOf } from '../types';

export const CompetitionStatusProps: MapOf<CompetitionStatus, { name: string }> = {
  [CompetitionStatus.UPCOMING]: { name: 'Upcoming' },
  [CompetitionStatus.ONGOING]: { name: 'Ongoing' },
  [CompetitionStatus.FINISHED]: { name: 'Finished' }
};
