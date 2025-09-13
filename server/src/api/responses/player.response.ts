/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Player } from '../../types';
import { pick } from '../../utils/pick.util';

export type PlayerResponse = Omit<Player, 'latestSnapshotId' | 'latestSnapshotDate'>;

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
