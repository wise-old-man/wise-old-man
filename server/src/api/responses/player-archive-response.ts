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
