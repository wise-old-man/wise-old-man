/**
 * Response types are used to format the data returned by the API.
 * They often include transformations, additional properties or sensitive field omissions.
 */
import { PlayerArchive } from '../../types';
import { pick } from '../../utils/pick.util';

// Currently 1:1 with the database model "PlayerArchive"
export type PlayerArchiveResponse = PlayerArchive;

export function formatPlayerArchiveResponse(playerArchive: PlayerArchive): PlayerArchiveResponse {
  return pick(
    playerArchive,
    'playerId',
    'previousUsername',
    'archiveUsername',
    'restoredUsername',
    'createdAt',
    'restoredAt'
  );
}
