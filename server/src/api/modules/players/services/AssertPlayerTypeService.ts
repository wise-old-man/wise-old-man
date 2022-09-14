import { BadRequestError, ServerError } from '../../../errors';
import prisma, { modifyPlayer, Player } from '../../../../prisma';
import { PlayerType } from '../../../../utils';
import * as jagexService from '../../../services/external/jagex.service';
import * as snapshotServices from '../../../modules/snapshots/snapshot.services';
import * as playerEvents from '../player.events';

type AssertPlayerTypeResult = [type: PlayerType, player: Player, changed: boolean];

async function assertPlayerType(player: Player, updateIfChanged = false): Promise<AssertPlayerTypeResult> {
  if (player.flagged) {
    throw new BadRequestError('Type Assertion Not Allowed: Player is Flagged.');
  }

  const confirmedType = await getType(player);

  if (player.type !== confirmedType && updateIfChanged) {
    const updatedPlayer = await prisma.player
      .update({
        data: { type: confirmedType },
        where: { id: player.id }
      })
      .then(modifyPlayer);

    playerEvents.onPlayerTypeChanged(updatedPlayer, player.type);

    return [confirmedType, updatedPlayer, true];
  }

  return [confirmedType, player, false];
}

async function getType(player: Pick<Player, 'username' | 'type'>): Promise<PlayerType> {
  const regularExp = await getOverallExperience(player, PlayerType.REGULAR);

  // This username is not on the hiscores
  if (!regularExp) {
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
    const hiscoresCSV = await jagexService.getHiscoresData(player.username, type || player.type);

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
