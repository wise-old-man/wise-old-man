/**
 * Response types are used to format the data returned by the API.
 * They often include transformations, additional properties or sensitive field omissions.
 */
import { Player, PlayerAnnotation, PlayerArchive, Snapshot } from '../../types';
import { getPlayerEfficiencyMap } from '../modules/efficiency/efficiency.utils';
import { getCombatLevelFromSnapshot } from '../modules/snapshots/snapshot.utils';
import { formatPlayerAnnotationResponse, PlayerAnnotationResponse } from './player-annotation-response';
import { formatPlayerArchiveResponse, PlayerArchiveResponse } from './player-archive-response';
import { formatPlayerResponse, PlayerResponse } from './player.response';
import { formatSnapshotResponse, SnapshotResponse } from './snapshot.response';

export interface PlayerDetailsResponse extends PlayerResponse {
  combatLevel: number;
  archive: PlayerArchiveResponse | null;
  annotations: Array<PlayerAnnotationResponse> | null;
  latestSnapshot: SnapshotResponse | null;
}

export function formatPlayerDetailsResponse(
  player: Player,
  snapshot: Snapshot | null,
  annotations: Array<PlayerAnnotation>,
  archive: PlayerArchive | null
): PlayerDetailsResponse {
  return {
    ...formatPlayerResponse(player),
    combatLevel: snapshot ? getCombatLevelFromSnapshot(snapshot) : 3,
    archive: archive === null ? null : formatPlayerArchiveResponse(archive),
    annotations: annotations.map(formatPlayerAnnotationResponse),
    latestSnapshot:
      snapshot === null ? null : formatSnapshotResponse(snapshot, getPlayerEfficiencyMap(snapshot, player))
  };
}
