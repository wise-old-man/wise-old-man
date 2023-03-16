import { isTesting } from '../../../env';
import { Period, PeriodProps, PlayerBuild } from '../../../utils';
import { Player, Snapshot } from '../../../prisma';
import { BadRequestError, NotFoundError } from '../../errors';
import redisService from '../../services/external/redis.service';
import { isF2p, is10HP, isZerker, isLvl3, is1Def } from '../snapshots/snapshot.utils';
import { findPlayer } from './services/FindPlayerService';

let UPDATE_COOLDOWN = isTesting() ? 0 : 60;

const YEAR_IN_SECONDS = PeriodProps[Period.YEAR].milliseconds / 1000;
const DECADE_IN_SECONDS = YEAR_IN_SECONDS * 10;

async function resolvePlayerId(username: string): Promise<number | null> {
  if (!username || username.length === 0) {
    throw new BadRequestError(`Parameter 'username' is undefined.`);
  }

  const cachedId = await getCachedPlayerId(username);
  if (cachedId) return cachedId;

  // Include username in the selected fields too, so that it can be cached for later
  const [player] = await findPlayer({ username }, ['id', 'username']);

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  return player.id;
}

async function resolvePlayer(username: string): Promise<Player | null> {
  if (!username || username.length === 0) {
    throw new BadRequestError('Undefined username.');
  }

  const [player] = await findPlayer({ username });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  return player;
}

async function resolvePlayerById(id: number): Promise<Player | null> {
  if (!id) {
    throw new BadRequestError('Undefined player ID.');
  }

  const [player] = await findPlayer({ id });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  return player;
}

async function getCachedPlayerId(username: string): Promise<number | null> {
  if (!username || username.length === 0) return null;

  const id = await redisService.getValue('player', standardize(username));
  return id ? Number(id) : null;
}

async function setCachedPlayerId(username: string, id: number | null) {
  if (!username || username.length === 0) return;

  if (id !== null) {
    // Store this username->ID in cache for an hour
    await redisService.setValue('player', standardize(username), id, 3_600_000);
  } else {
    await redisService.deleteKey(`player:${standardize(username)}`);
  }
}

// For integration testing purposes
export function setUpdateCooldown(seconds: number) {
  UPDATE_COOLDOWN = seconds;
}

/**
 * Format a username into a standardized version,
 * replacing any special characters, and forcing lower case.
 *
 * "Psikoi" -> "psikoi",
 * "Hello_world  " -> "hello world"
 */
function standardize(username: string): string {
  if (!username || typeof username !== 'string') return null;
  return sanitize(username).toLowerCase();
}

function sanitize(username: string): string {
  return username.replace(/[-_\s]/g, ' ').trim();
}

function validateUsername(username: string): Error | null {
  const standardized = standardize(username);

  if (!standardized) {
    return new Error('Username must be defined.');
  }

  // If doesn't meet the size requirements
  if (standardized.length < 1 || standardized.length > 12) {
    return new Error('Username must be between 1 and 12 characters long.');
  }

  // If starts or ends with a space
  if (standardized.startsWith(' ') || standardized.endsWith(' ')) {
    return new Error('Username cannot start or end with spaces.');
  }

  // If has any special characters
  if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(standardized)) {
    return new Error('Username cannot contain any special characters.');
  }

  return null;
}

function isValidUsername(username: string): boolean {
  return validateUsername(username) === null;
}

/**
 * Checks if a given player has been updated in the last 60 seconds.
 */
function shouldUpdate(player: Pick<Player, 'updatedAt' | 'registeredAt' | 'lastChangedAt'>): boolean {
  if (!player.updatedAt) return true;

  const timeSinceLastUpdate = Math.floor((Date.now() - player.updatedAt.getTime()) / 1000);
  const timeSinceRegistration = Math.floor((Date.now() - player.registeredAt.getTime()) / 1000);

  return timeSinceLastUpdate >= UPDATE_COOLDOWN || (timeSinceRegistration <= 60 && !player.lastChangedAt);
}

/**
 * Checks if a given player has been imported from CML in the last 24 hours.
 */
function shouldImport(lastImportedAt: Date | null): [boolean, number] {
  // If the player's CML history has never been
  // imported, should import the last years
  if (!lastImportedAt) return [true, DECADE_IN_SECONDS];

  const seconds = Math.floor((Date.now() - lastImportedAt.getTime()) / 1000);

  return [seconds / 60 / 60 >= 24, seconds];
}

function getBuild(snapshot: Snapshot): PlayerBuild {
  if (isF2p(snapshot)) return PlayerBuild.F2P;
  if (isLvl3(snapshot)) return PlayerBuild.LVL3;
  // This must be above 1def because 10 HP accounts can also have 1 def
  if (is10HP(snapshot)) return PlayerBuild.HP10;
  if (is1Def(snapshot)) return PlayerBuild.DEF1;
  if (isZerker(snapshot)) return PlayerBuild.ZERKER;

  return PlayerBuild.MAIN;
}

export {
  standardize,
  sanitize,
  validateUsername,
  isValidUsername,
  shouldUpdate,
  shouldImport,
  getBuild,
  resolvePlayer,
  resolvePlayerId,
  resolvePlayerById,
  setCachedPlayerId
};
