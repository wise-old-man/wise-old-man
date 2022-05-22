import { BadRequestError, ServerError } from '../../../errors';
import prisma, { modifyPlayer, Player, PlayerTypeEnum } from '../../../../prisma';
import * as jagexService from '../../../services/external/jagex.service';
import * as snapshotService from '../../../services/internal/snapshot.service';

type AssertPlayerTypeResult = [type: PlayerTypeEnum, player: Player, changed: boolean];

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

    return [confirmedType, updatedPlayer, true];
  }

  return [confirmedType, player, false];
}

async function getType(player: Pick<Player, 'username' | 'type'>): Promise<PlayerTypeEnum> {
  const regularExp = await getOverallExperience(player, PlayerTypeEnum.REGULAR);

  // This username is not on the hiscores
  if (!regularExp) {
    throw new BadRequestError(`Failed to load hiscores for ${player.username}.`);
  }

  const ironmanExp = await getOverallExperience(player, PlayerTypeEnum.IRONMAN);
  if (!ironmanExp || ironmanExp < regularExp) return PlayerTypeEnum.REGULAR;

  const hardcoreExp = await getOverallExperience(player, PlayerTypeEnum.HARDCORE);
  if (hardcoreExp && hardcoreExp >= ironmanExp) return PlayerTypeEnum.HARDCORE;

  const ultimateExp = await getOverallExperience(player, PlayerTypeEnum.ULTIMATE);
  if (ultimateExp && ultimateExp >= ironmanExp) return PlayerTypeEnum.ULTIMATE;

  return PlayerTypeEnum.IRONMAN;
}

async function getOverallExperience(player: Pick<Player, 'username' | 'type'>, type: PlayerTypeEnum) {
  try {
    // Load data from OSRS hiscores
    const hiscoresCSV = await jagexService.getHiscoresData(player.username, (type || player.type) as any);

    // Convert the csv data to a Snapshot instance
    const snapshot = await snapshotService.legacy_fromRS(0, hiscoresCSV);

    return snapshot.overallExperience;
  } catch (e) {
    if (e instanceof ServerError) throw e;
    return null;
  }
}

export { assertPlayerType };
