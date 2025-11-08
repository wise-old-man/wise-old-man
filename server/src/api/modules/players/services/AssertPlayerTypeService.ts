import { AsyncResult, complete, errored, isComplete, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { fetchHiscoresJSON, HiscoresError } from '../../../../services/jagex.service';
import { Player, PlayerType } from '../../../../types';
import { eventEmitter, EventType } from '../../../events';
import { buildHiscoresSnapshot } from '../../snapshots/services/BuildHiscoresSnapshot';

async function assertPlayerType(player: Player): AsyncResult<
  | {
      type: PlayerType;
      changed: false;
    }
  | {
      type: PlayerType;
      changed: true;
      updatedPlayer: Player;
    },
  HiscoresError
> {
  const confirmedTypeResult = await checkType(player.username);

  if (isErrored(confirmedTypeResult)) {
    return errored(confirmedTypeResult.error.subError);
  }

  if (player.type === confirmedTypeResult.value) {
    return complete({
      type: confirmedTypeResult.value,
      changed: false
    });
  }

  const updatedPlayer = await prisma.player.update({
    where: {
      id: player.id
    },
    data: {
      type: confirmedTypeResult.value
    }
  });

  eventEmitter.emit(EventType.PLAYER_TYPE_CHANGED, {
    username: player.username,
    previousType: player.type,
    newType: confirmedTypeResult.value
  });

  return complete({
    changed: true,
    updatedPlayer,
    type: confirmedTypeResult.value
  });
}

async function findIronmanSubType(username: string): AsyncResult<
  { type: PlayerType; exp: number },
  | {
      code: 'FAILED_TO_LOAD_HISCORES';
      subError: Exclude<HiscoresError, { code: 'HISCORES_USERNAME_NOT_FOUND' }>;
    }
  | { code: 'NOT_AN_IRONMAN' }
> {
  const ironmanExpResult = await getOverallExperience(username, PlayerType.IRONMAN);

  if (isErrored(ironmanExpResult)) {
    return ironmanExpResult;
  }

  if (ironmanExpResult.value === -1) {
    return errored({ code: 'NOT_AN_IRONMAN' } as const);
  }

  const hardcoreExpResult = await getOverallExperience(username, PlayerType.HARDCORE);

  if (isErrored(hardcoreExpResult)) {
    return hardcoreExpResult;
  }

  if (hardcoreExpResult.value && hardcoreExpResult.value >= ironmanExpResult.value) {
    return complete({
      type: PlayerType.HARDCORE,
      exp: hardcoreExpResult.value
    });
  }

  const ultimateExpResult = await getOverallExperience(username, PlayerType.ULTIMATE);

  if (isErrored(ultimateExpResult)) {
    return ultimateExpResult;
  }

  if (ultimateExpResult.value && ultimateExpResult.value >= ironmanExpResult.value) {
    return complete({
      type: PlayerType.ULTIMATE,
      exp: ultimateExpResult.value
    });
  }

  return complete({
    type: PlayerType.IRONMAN,
    exp: ironmanExpResult.value
  });
}

async function checkType(
  username: string
): AsyncResult<PlayerType, { code: 'FAILED_TO_LOAD_HISCORES'; subError: HiscoresError }> {
  const regularExpResult = await getOverallExperience(username, PlayerType.REGULAR);

  if (isErrored(regularExpResult)) {
    return regularExpResult;
  }

  const ironmanSubTypeResult = await findIronmanSubType(username);

  if (isComplete(ironmanSubTypeResult)) {
    if (ironmanSubTypeResult.value.exp < regularExpResult.value) {
      // They're on the IM hiscores, but their main stats have diverged, which means they have deironed
      return complete(PlayerType.REGULAR);
    }

    return complete(ironmanSubTypeResult.value.type);
  }

  if (ironmanSubTypeResult.error.code !== 'NOT_AN_IRONMAN') {
    // If the hiscores request failed for some reason other than 404 not found
    return errored({
      code: 'FAILED_TO_LOAD_HISCORES',
      subError: ironmanSubTypeResult.error.subError
    } as const);
  }

  if (regularExpResult.value === -1) {
    // This username is not on the regular hiscores or the ironman hiscores
    // Low level ironman accounts show up on the ironman hiscores, but not yet on the regular,
    // but in this case, they don't show up in either hiscores, so we can assume they don't exist

    return errored({
      code: 'FAILED_TO_LOAD_HISCORES',
      subError: { code: 'HISCORES_USERNAME_NOT_FOUND' }
    } as const);
  }

  return complete(PlayerType.REGULAR);
}

async function getOverallExperience(
  username: string,
  type: PlayerType
): AsyncResult<
  number,
  {
    code: 'FAILED_TO_LOAD_HISCORES';
    subError: Exclude<HiscoresError, { code: 'HISCORES_USERNAME_NOT_FOUND' }>;
  }
> {
  const hiscoresResult = await fetchHiscoresJSON(username, type);

  if (isComplete(hiscoresResult)) {
    const parsedSnapshot = buildHiscoresSnapshot(1, hiscoresResult.value);

    return complete(parsedSnapshot.overallExperience);
  }

  if (hiscoresResult.error.code === 'HISCORES_USERNAME_NOT_FOUND') {
    return complete(-1);
  }

  return errored({
    code: 'FAILED_TO_LOAD_HISCORES',
    subError: hiscoresResult.error
  } as const);
}

export { assertPlayerType };
