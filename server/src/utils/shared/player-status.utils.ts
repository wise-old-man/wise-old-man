import { PlayerStatus } from '../../types';
import { MapOf } from '../types';

export const PlayerStatusProps: MapOf<PlayerStatus, { name: string }> = {
  [PlayerStatus.ACTIVE]: { name: 'Active' },
  [PlayerStatus.UNRANKED]: { name: 'Unranked' },
  [PlayerStatus.FLAGGED]: { name: 'Flagged' },
  [PlayerStatus.ARCHIVED]: { name: 'Archived' },
  [PlayerStatus.BANNED]: { name: 'Banned' }
};

export function isPlayerStatus(statusString: string): statusString is PlayerStatus {
  return statusString in PlayerStatusProps;
}
