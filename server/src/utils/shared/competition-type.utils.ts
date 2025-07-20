import { CompetitionType } from '../../types';
import { MapOf } from '../types';

export const CompetitionTypeProps: MapOf<CompetitionType, { name: string }> = {
  [CompetitionType.CLASSIC]: { name: 'Classic' },
  [CompetitionType.TEAM]: { name: 'Team' }
};
