import { CompetitionType } from '../../types';

export const CompetitionTypeProps: Record<CompetitionType, { name: string }> = {
  [CompetitionType.CLASSIC]: { name: 'Classic' },
  [CompetitionType.TEAM]: { name: 'Team' }
};
