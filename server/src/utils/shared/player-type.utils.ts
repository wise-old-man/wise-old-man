import { PlayerType } from '../../types';
import { MapOf } from '../types';

export const PlayerTypeProps: MapOf<PlayerType, { name: string }> = {
  [PlayerType.UNKNOWN]: { name: 'Unknown' },
  [PlayerType.REGULAR]: { name: 'Regular' },
  [PlayerType.IRONMAN]: { name: 'Ironman' },
  [PlayerType.HARDCORE]: { name: 'Hardcore' },
  [PlayerType.ULTIMATE]: { name: 'Ultimate' }
};

export function isPlayerType(typeString: string): typeString is PlayerType {
  return typeString in PlayerTypeProps;
}
