import { CompetitionStatus } from '../../types';
import { MapOf } from '../types';

export const CompetitionStatusProps: MapOf<CompetitionStatus, { name: string }> = {
  [CompetitionStatus.UPCOMING]: { name: 'Upcoming' },
  [CompetitionStatus.ONGOING]: { name: 'Ongoing' },
  [CompetitionStatus.FINISHED]: { name: 'Finished' }
};
