import { MapOf } from '../types';

export enum CompetitionType {
  CLASSIC = 'classic',
  TEAM = 'team'
}

export const CompetitionTypeProps: MapOf<CompetitionType, { name: string }> = {
  [CompetitionType.CLASSIC]: { name: 'Classic' },
  [CompetitionType.TEAM]: { name: 'Team' }
};

export const COMPETITION_TYPES = Object.values(CompetitionType);
