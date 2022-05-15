import { Period, PeriodProps } from '@wise-old-man/utils';
import { isTesting } from '../../../env';
import { Player, PlayerBuildEnum, PlayerTypeEnum, Snapshot } from '../../../prisma';
import { isF2p, is10HP, isZerker, isLvl3, is1Def } from '../../util/experience';
import redisService from '../../services/external/redis.service';

let UPDATE_COOLDOWN = isTesting() ? 0 : 60;

const DAY_IN_SECONDS = PeriodProps[Period.DAY].milliseconds / 1000;
const YEAR_IN_SECONDS = PeriodProps[Period.YEAR].milliseconds / 1000;
const DECADE_IN_SECONDS = YEAR_IN_SECONDS * 10;

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

function isValidUsername(username: string): boolean {
  if (typeof username !== 'string') return false;

  const standardized = standardize(username);

  if (!standardized) return false;

  // If doesn't meet the size requirements
  if (standardized.length < 1 || standardized.length > 12) return false;

  // If starts or ends with a space
  if (standardized.startsWith(' ') || standardized.endsWith(' ')) return false;

  // If has any special characters
  if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(standardized)) return false;

  return true;
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

/**
 * Checks if a given player should have their player type reviewed.
 * This is useful to periodically re-check iron players' acc types. Incase of de-ironing.
 */
async function shouldReviewType(
  player: Pick<Player, 'username' | 'type' | 'lastChangedAt'>
): Promise<boolean> {
  const { username, type, lastChangedAt } = player;

  // Type reviews should only be done on iron players
  if (type === PlayerTypeEnum.REGULAR || type === PlayerTypeEnum.UNKNOWN) return false;

  // After checking a player's type, we add their username to a cache that blocks
  // this action to be repeated again within the next week (as to not overload the server)
  const hasCooldown = !!(await redisService.getValue('cd:PlayerTypeReview', username));

  // If player hasn't gained exp in over 24h, despite being updated recently
  const isInactive = !lastChangedAt || (Date.now() - lastChangedAt.getTime()) / 1000 > DAY_IN_SECONDS;

  return !hasCooldown && isInactive;
}

function getBuild(snapshot: Snapshot): PlayerBuildEnum {
  if (isF2p(snapshot as any)) return PlayerBuildEnum.F2P;
  if (isLvl3(snapshot as any)) return PlayerBuildEnum.LVL3;
  // This must be above 1def because 10 HP accounts can also have 1 def
  if (is10HP(snapshot as any)) return PlayerBuildEnum.HP10;
  if (is1Def(snapshot as any)) return PlayerBuildEnum.DEF1;
  if (isZerker(snapshot as any)) return PlayerBuildEnum.ZERKER;

  return PlayerBuildEnum.MAIN;
}

export { standardize, sanitize, isValidUsername, shouldUpdate, shouldImport, shouldReviewType, getBuild };
