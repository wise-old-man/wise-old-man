import { z } from 'zod';
import prisma, { modifyPlayer, modifySnapshot, Player, PrismaTypes, Snapshot } from '../../../../prisma';
import { PlayerType } from '../../../../utils';
import { RateLimitError, ServerError } from '../../../errors';
import { getBuild, shouldUpdate } from '../player.utils';
import * as jagexService from '../../../services/external/jagex.service';
import * as efficiencyServices from '../../efficiency/efficiency.services';
import * as snapshotServices from '../../snapshots/snapshot.services';
import * as snapshotUtils from '../../snapshots/snapshot.utils';
import * as playerEvents from '../player.events';
import { findPlayer } from './FindPlayerService';
import { assertPlayerType } from './AssertPlayerTypeService';
import { fetchPlayerDetails } from './FetchPlayerDetailsService';
import { PlayerDetails } from '../player.types';

const inputSchema = z.object({
  username: z.string()
});

type UpdatePlayerParams = z.infer<typeof inputSchema>;
type UpdatePlayerResult = [playerDetails: PlayerDetails, isNew: boolean];

async function updatePlayer(payload: UpdatePlayerParams): Promise<UpdatePlayerResult> {
  const { username } = inputSchema.parse(payload);

  // Find a player with the given username or create a new one if needed
  const [player, isNew] = await findPlayer({ username, createIfNotFound: true });

  // If the player was updated recently, don't update it
  if (!shouldUpdate(player) && !isNew) {
    throw new RateLimitError(`Error: ${username} has been updated recently.`);
  }

  try {
    const updatedPlayerFields: PrismaTypes.PlayerUpdateInput = {};

    // Always determine the rank before tracking (to fetch correct ranks)
    if (player.type === PlayerType.UNKNOWN) {
      const [type] = await assertPlayerType(player);
      updatedPlayerFields.type = type;
    }

    // Fetch the previous player stats from the database
    const previousStats = await snapshotServices.findPlayerSnapshot({ id: player.id });

    // Fetch the new player stats from the hiscores API
    const currentStats = await fetchStats(player, updatedPlayerFields.type as PlayerType);

    // There has been a significant change in this player's stats, mark it as flagged
    if (!snapshotUtils.withinRange(previousStats, currentStats)) {
      await prisma.player.update({ data: { flagged: true }, where: { id: player.id } });
      throw new ServerError('Failed to update: Unregistered name change.');
    }

    // The player has gained exp/kc/scores since the last update
    let hasChanged = false;

    if (snapshotUtils.hasChanged(previousStats, currentStats)) {
      updatedPlayerFields.lastChangedAt = new Date();
      hasChanged = true;
    }

    // Refresh the player's build
    updatedPlayerFields.build = getBuild(currentStats);
    updatedPlayerFields.flagged = false;

    const computedMetrics = await efficiencyServices.computePlayerMetrics({
      player,
      snapshot: currentStats
    });

    // Set the player's global computed data
    updatedPlayerFields.exp = currentStats.overallExperience;
    updatedPlayerFields.ehp = computedMetrics.ehpValue;
    updatedPlayerFields.ehb = computedMetrics.ehbValue;
    updatedPlayerFields.ttm = computedMetrics.ttm;
    updatedPlayerFields.tt200m = computedMetrics.tt200m;

    // Add the computed metrics to the snapshot
    currentStats.ehpValue = computedMetrics.ehpValue;
    currentStats.ehpRank = computedMetrics.ehpRank;
    currentStats.ehbValue = computedMetrics.ehbValue;
    currentStats.ehbRank = computedMetrics.ehbRank;

    // update player with all this new data
    const updatedPlayer = await prisma.player
      .update({
        data: updatedPlayerFields,
        where: { id: player.id }
      })
      .then(modifyPlayer);

    // Create (and save) a new snapshot
    const newSnapshot = await prisma.snapshot.create({ data: currentStats }).then(modifySnapshot);

    playerEvents.onPlayerUpdated(updatedPlayer, newSnapshot, hasChanged);

    const playerDetails = await fetchPlayerDetails(updatedPlayer, newSnapshot);

    return [playerDetails, isNew];
  } catch (error) {
    if (isNew && player.type !== PlayerType.UNKNOWN) {
      // If the player was just registered and it failed to fetch hiscores,
      // set updatedAt to null to allow for re-attempts without the 60s waiting period
      await prisma.player.update({ data: { updatedAt: null }, where: { id: player.id } });
    }

    throw error;
  }
}

async function fetchStats(player: Player, type?: PlayerType): Promise<Snapshot> {
  // Load data from OSRS hiscores
  const hiscoresCSV = await jagexService.getHiscoresData(player.username, type || player.type);

  // Convert the csv data to a Snapshot instance
  const newSnapshot = await snapshotServices.buildSnapshot({ playerId: player.id, rawCSV: hiscoresCSV });

  return newSnapshot;
}

export { updatePlayer };
