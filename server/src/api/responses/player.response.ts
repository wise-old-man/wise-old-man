import { Player } from '../../types';
import { pick } from '../../utils/pick.util';

// Currently 1:1 with the database model "Player"
export type PlayerResponse = Omit<Player, 'latestSnapshotId'>;

export function formatPlayerResponse(player: Player): PlayerResponse {
  return pick(
    player,
    'id',
    'username',
    'displayName',
    'type',
    'build',
    'status',
    'country',
    'patron',
    'exp',
    'ehp',
    'ehb',
    'ttm',
    'tt200m',
    'registeredAt',
    'updatedAt',
    'lastChangedAt',
    'lastImportedAt'
  );
}
