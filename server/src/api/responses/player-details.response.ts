/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Player, PlayerAnnotation, PlayerArchive, Snapshot } from '../../types';
import { getPlayerEfficiencyMap } from '../modules/efficiency/efficiency.utils';
import { getCombatLevelFromSnapshot } from '../modules/snapshots/snapshot.utils';
import { formatPlayerAnnotationResponse, PlayerAnnotationResponse } from './player-annotation.response';
import { formatPlayerArchiveResponse, PlayerArchiveResponse } from './player-archive.response';
import { formatPlayerResponse, PlayerResponse } from './player.response';
import { formatSnapshotResponse, SnapshotResponse } from './snapshot.response';

export interface PlayerDetailsResponse extends PlayerResponse {
  combatLevel: number;
  archive: PlayerArchiveResponse | null;
  annotations: Array<PlayerAnnotationResponse> | null;
  latestSnapshot: SnapshotResponse | null;
}

export function formatPlayerDetailsResponse(playerDetails: {
  player: Player;
  latestSnapshot: Snapshot | null;
  annotations: Array<PlayerAnnotation>;
  archive: PlayerArchive | null;
}): PlayerDetailsResponse {
  return {
    ...formatPlayerResponse(playerDetails.player),
    combatLevel: playerDetails.latestSnapshot ? getCombatLevelFromSnapshot(playerDetails.latestSnapshot) : 3,
    archive: playerDetails.archive === null ? null : formatPlayerArchiveResponse(playerDetails.archive),
    annotations: playerDetails.annotations.map(formatPlayerAnnotationResponse),
    latestSnapshot:
      playerDetails.latestSnapshot === null
        ? null
        : formatSnapshotResponse(
            playerDetails.latestSnapshot,
            getPlayerEfficiencyMap(playerDetails.latestSnapshot, playerDetails.player)
          )
  };
}
