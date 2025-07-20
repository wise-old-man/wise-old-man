import { CompetitionType } from '../../types/competition-type.enum';
import { MapOf } from '../types';

export const CompetitionTypeProps: MapOf<CompetitionType, { name: string }> = {
  [CompetitionType.CLASSIC]: { name: 'Classic' },
  [CompetitionType.TEAM]: { name: 'Team' }
};
