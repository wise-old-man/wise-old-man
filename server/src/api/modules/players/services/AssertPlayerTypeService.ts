import { BadRequestError, ServerError } from '../../../errors';
import prisma, { Player } from '../../../../prisma';
import { PlayerType } from '../../../../utils';
import logger from '../../../util/logging';
import * as jagexService from '../../../services/external/jagex.service';
import * as snapshotServices from '../../../modules/snapshots/snapshot.services';
import * as playerEvents from '../player.events';

type AssertPlayerTypeResult = [type: PlayerType, player: Player, changed: boolean];

async function assertPlayerType(player: Player, updateIfChanged = false): Promise<AssertPlayerTypeResult> {
  const confirmedType = await getType(player);

  if (player.type !== confirmedType && updateIfChanged) {
    const updatedPlayer = await prisma.player.update({
      data: { type: confirmedType },
      where: { id: player.id }
    });

    playerEvents.onPlayerTypeChanged(updatedPlayer, player.type);

    logger.moderation(`[Player:${player.username}] Type updated to ${confirmedType}`);

    return [confirmedType, updatedPlayer, true];
  }

  return [confirmedType, player, false];
}

async function getType(player: Pick<Player, 'username' | 'type'>): Promise<PlayerType> {
  const regularExp = await getOverallExperience(player, PlayerType.REGULAR);

  // This username is not on the hiscores
  if (!regularExp) {
    // Low level ironman accounts show up on the ironman hiscores, but not yet on the main ones
    // (due to minimum fixed rank requirement), so let's not keep them as unknown until they git gud, that's not nice
    const ironmanExp = await getOverallExperience(player, PlayerType.IRONMAN);

    if (ironmanExp) {
      const hardcoreExp = await getOverallExperience(player, PlayerType.HARDCORE);
      if (hardcoreExp && hardcoreExp >= ironmanExp) return PlayerType.HARDCORE;

      const ultimateExp = await getOverallExperience(player, PlayerType.ULTIMATE);
      if (ultimateExp && ultimateExp >= ironmanExp) return PlayerType.ULTIMATE;

      return PlayerType.IRONMAN;
    }

    throw new BadRequestError(`Failed to load hiscores for ${player.username}.`);
  }

  const ironmanExp = await getOverallExperience(player, PlayerType.IRONMAN);
  if (!ironmanExp || ironmanExp < regularExp) return PlayerType.REGULAR;

  const hardcoreExp = await getOverallExperience(player, PlayerType.HARDCORE);
  if (hardcoreExp && hardcoreExp >= ironmanExp) return PlayerType.HARDCORE;

  const ultimateExp = await getOverallExperience(player, PlayerType.ULTIMATE);
  if (ultimateExp && ultimateExp >= ironmanExp) return PlayerType.ULTIMATE;

  return PlayerType.IRONMAN;
}

async function getOverallExperience(player: Pick<Player, 'username' | 'type'>, type: PlayerType) {
  try {
    // Load data from OSRS hiscores
    const hiscoresCSV = await jagexService.fetchHiscoresData(player.username, type || player.type);

    // Convert the csv data to a Snapshot instance
    // The playerId doesn't matter here, this snapshot won't be saved to this id
    const snapshot = await snapshotServices.buildSnapshot({ playerId: 1, rawCSV: hiscoresCSV });

    return snapshot.overallExperience;
  } catch (e) {
    if (e instanceof ServerError) throw e;
    return null;
  }
}

export { assertPlayerType };
