import { Snapshot, Player } from '../../../../prisma';
import * as snapshotServices from '../../snapshots/snapshot.services';
import * as snapshotUtils from '../../snapshots/snapshot.utils';
import * as efficiencyUtils from '../../efficiency/efficiency.utils';
import { PlayerDetails } from '../player.types';

async function fetchPlayerDetails(player: Player, latestSnapshot?: Snapshot): Promise<PlayerDetails> {
  // Fetch the player's latest snapshot, if not supplied yet
  const stats = latestSnapshot || (await snapshotServices.findPlayerSnapshot({ id: player.id }));

  const efficiency = stats && efficiencyUtils.getPlayerEfficiencyMap(stats, player);
  const combatLevel = snapshotUtils.getCombatLevelFromSnapshot(stats);

  return {
    ...player,
    combatLevel,
    latestSnapshot: snapshotUtils.format(stats, efficiency)
  };
}

export { fetchPlayerDetails };
