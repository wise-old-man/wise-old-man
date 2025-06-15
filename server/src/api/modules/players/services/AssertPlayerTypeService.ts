import prisma, { Player } from '../../../../prisma';
import { adaptFetchableToThrowable, fetchHiscoresData } from '../../../../services/jagex.service';
import { PlayerType } from '../../../../utils';
import { BadRequestError, ServerError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';
import { parseHiscoresSnapshot } from '../../snapshots/snapshot.utils';

type AssertPlayerTypeResult = [type: PlayerType, player: Player, changed: boolean];

async function assertPlayerType(player: Player, updateIfChanged = false): Promise<AssertPlayerTypeResult> {
  const confirmedType = await getType(player);

  if (player.type !== confirmedType && updateIfChanged) {
    const updatedPlayer = await prisma.player.update({
      data: { type: confirmedType },
      where: { id: player.id }
    });

    eventEmitter.emit(EventType.PLAYER_TYPE_CHANGED, {
      username: player.username,
      previousType: player.type,
      newType: confirmedType
    });

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
    const hiscoresCSV = adaptFetchableToThrowable(
      await fetchHiscoresData(player.username, type || player.type)
    );

    // Convert the csv data to a Snapshot instance
    // The playerId doesn't matter here, this snapshot won't be saved to this id
    const snapshot = await parseHiscoresSnapshot(1, hiscoresCSV);

    return snapshot.overallExperience;
  } catch (e) {
    if (e instanceof ServerError) throw e;
    return null;
  }
}

export { assertPlayerType };
