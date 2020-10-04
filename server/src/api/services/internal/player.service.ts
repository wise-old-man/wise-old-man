import { Op } from 'sequelize';
import { Player, Snapshot } from '../../../database/models';
import { PlayerResolvable } from '../../../types';
import { BadRequestError, NotFoundError, RateLimitError, ServerError } from '../../errors';
import { isValidDate } from '../../util/dates';
import { getCombatLevel, is10HP, is1Def, isF2p, isLvl3 } from '../../util/level';
import * as cmlService from '../external/cml.service';
import * as jagexService from '../external/jagex.service';
import * as snapshotService from './snapshot.service';

const YEAR_IN_SECONDS = 31556926;
const DECADE_IN_SECONDS = 315569260;

interface PlayerDetails extends Player {
  combatLevel: number;
  stats: any;
}

/**
 * Format a username into a standardized version,
 * replacing any special characters, and forcing lower case.
 *
 * "Psikoi" -> "psikoi",
 * "Hello_world  " -> "hello world"
 */
function standardize(username: string): string {
  return sanitize(username).toLowerCase();
}

function sanitize(username: string): string {
  return username.replace(/[-_\s]/g, ' ').trim();
}

function isValidUsername(username: string): boolean {
  if (typeof username !== 'string') return false;

  const standardized = standardize(username);

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
function shouldUpdate(player: Player): [boolean, number] {
  if (!player.updatedAt || !isValidDate(player.updatedAt)) {
    return [true, DECADE_IN_SECONDS];
  }

  const seconds = Math.floor((Date.now() - player.updatedAt.getTime()) / 1000);

  return [seconds >= 60, seconds];
}

/**
 * Checks if a given player has been imported from CML in the last 24 hours.
 */
function shouldImport(player: Player): [boolean, number] {
  // If the player's CML history has never been
  // imported, should import the last years
  if (!player.lastImportedAt || !isValidDate(player.lastImportedAt)) {
    return [true, DECADE_IN_SECONDS];
  }

  const seconds = Math.floor(Date.now() - player.lastImportedAt.getTime() / 1000);

  return [seconds / 60 / 60 >= 24, seconds];
}

async function resolve(playerResolvable: PlayerResolvable): Promise<Player> {
  let player;

  if (playerResolvable.id) {
    player = await findById(playerResolvable.id);
  } else if (playerResolvable.username) {
    player = await find(playerResolvable.username);
  }

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  return player;
}

async function resolveId(playerResolvable: PlayerResolvable): Promise<number> {
  if (playerResolvable.id) return playerResolvable.id;

  const player = await resolve(playerResolvable);
  return player.id;
}

/**
 * Get the latest date on a given username. (Player info and latest snapshot)
 */
async function getDetails(player: Player, snapshot?: Snapshot): Promise<PlayerDetails> {
  const latestSnapshot = snapshot || (await snapshotService.findLatest(player.id));
  const combatLevel = getCombatLevel(latestSnapshot);

  return {
    ...(player.toJSON() as any),
    combatLevel,
    stats: snapshotService.format(latestSnapshot)
  };
}

/**
 * Search for players with a (partially) matching username.
 */
async function search(username: string): Promise<Player[]> {
  const players = await Player.findAll({
    where: {
      username: {
        [Op.like]: `${standardize(username)}%`
      }
    },
    limit: 20
  });

  return players;
}

/**
 * Update a given username, by getting its latest
 * hiscores data, saving it as a new player if necessary.
 */
async function update(username: string): Promise<[PlayerDetails, boolean]> {
  // Find a player with the given username or create a new one if needed
  const [player, isNew] = await findOrCreate(username);
  // Check if this player should be updated again
  const [should] = shouldUpdate(player);

  // If the player was updated recently, don't update it
  if (!should && !isNew) {
    throw new RateLimitError(`Error: ${username} has been updated recently.`);
  }

  try {
    // If the player is new or has an unknown player type,
    // determine it before tracking (to get the correct ranks)
    if (player.type === 'unknown') {
      player.type = await getType(player);
    }

    // Get the latest snapshot from the DB
    const previousSnapshot = await snapshotService.findLatest(player.id);

    // Fetch the latest stats from the hiscores
    const currentSnapshot = await fetchStats(player);

    // There has been a radical change in this player's stats, mark it as flagged
    if (!snapshotService.withinRange(previousSnapshot, currentSnapshot)) {
      await player.update({ flagged: true });
      throw new ServerError('Failed to update: Unregistered name change.');
    }

    // Update the player's build
    player.build = getBuild(currentSnapshot);
    // If the player has reached this point, it's certainly not flagged
    player.flagged = false;

    await currentSnapshot.save();

    await player.changed('updatedAt', true);
    await player.save();

    const playerDetails = await getDetails(player, currentSnapshot);

    return [playerDetails, isNew];
  } catch (e) {
    // If the player was just registered and it failed to fetch hiscores,
    // set updatedAt to null to allow for re-attempts without the 60s waiting period
    if (isNew && player.type !== 'unknown') {
      await Player.update({ updatedAt: null }, { where: { id: player.id }, silent: true });
    }

    throw e;
  }
}

/**
 * Import a given username from CML.
 * If this is a first import, it will attempt to import as many
 * datapoints as it can. If it has imported in the past, it will
 * attempt to import all the datapoints CML gathered since the last import.
 */
async function importCML(player: Player): Promise<Snapshot[]> {
  const [should, seconds] = shouldImport(player);

  // If the player hasn't imported in over 24h,
  // attempt to import its history from CML
  if (!should) {
    const timeLeft = Math.floor((24 * 3600 - seconds) / 60);
    throw new RateLimitError(`Imported too soon, please wait another ${timeLeft} minutes.`);
  }

  const importedSnapshots = [];

  // If the player hasn't imported in over a year
  // import the last year and decade.
  if (seconds >= YEAR_IN_SECONDS) {
    const yearSnapshots = await importCMLSince(player, YEAR_IN_SECONDS);
    const decadeSnapshots = await importCMLSince(player, DECADE_IN_SECONDS);

    importedSnapshots.push(...yearSnapshots);
    importedSnapshots.push(...decadeSnapshots);
  } else {
    const recentSnapshots = await importCMLSince(player, seconds);
    importedSnapshots.push(recentSnapshots);
  }

  // Update the "lastImportedAt" field in the player model
  await player.update({ lastImportedAt: new Date() });

  return importedSnapshots;
}

async function importCMLSince(player: Player, time: number): Promise<Snapshot[]> {
  // Load the CML history
  const history = await cmlService.getCMLHistory(player.username, time);

  // Convert the CML csv data to Snapshot instances
  const snapshots = await Promise.all(history.map(row => snapshotService.fromCML(player.id, row)));

  // Ignore any CML snapshots past May 10th 2020 (when we introduced boss tracking)
  const pastSnapshots = snapshots.filter((s: any) => s.createdAt < new Date('2020-05-10'));

  // Save new snapshots to db
  const savedSnapshots = await snapshotService.saveAll(pastSnapshots);

  return savedSnapshots;
}

async function fetchStats(player: Player, type?: string): Promise<Snapshot> {
  // Load data from OSRS hiscores
  const hiscoresCSV = await jagexService.getHiscoresData(player.username, type || player.type);

  // Convert the csv data to a Snapshot instance (saved in the DB)
  const newSnapshot = await snapshotService.fromRS(player.id, hiscoresCSV);

  return newSnapshot;
}

/**
 * Gets a player's overall exp in a specific hiscores endpoint.
 * Note: This is an auxilary function for the getType function.
 */
async function getOverallExperience(player: Player, type: string): Promise<number> {
  try {
    return (await fetchStats(player, type)).overallExperience;
  } catch (e) {
    if (e instanceof ServerError) throw e;
    return -1;
  }
}

async function getType(player: Player): Promise<string> {
  const regularExp = await getOverallExperience(player, 'regular');

  // This username is not on the hiscores
  if (regularExp === -1) {
    throw new BadRequestError(`Failed to load hiscores for ${player.displayName}.`);
  }

  const ironmanExp = await getOverallExperience(player, 'ironman');
  if (ironmanExp < regularExp) return 'regular';

  const hardcoreExp = await getOverallExperience(player, 'hardcore');
  if (hardcoreExp >= ironmanExp) return 'hardcore';

  const ultimateExp = await getOverallExperience(player, 'ultimate');
  if (ultimateExp >= ironmanExp) return 'ultimate';

  return 'ironman';
}

/**
 * Fetch various hiscores endpoints to find the correct player type of a given player.
 */
async function assertType(player: Player): Promise<string> {
  const type = await getType(player);

  if (player.type !== type) {
    await player.update({ type });
  }

  return type;
}

/**
 * Fetch the hiscores table overall to find the correct capitalization of a given player.
 */
async function assertName(player: Player): Promise<string> {
  const { username } = player;

  const hiscoresNames = await jagexService.getHiscoresNames(username);
  const match = hiscoresNames.find(h => standardize(h) === username);

  if (!match) {
    throw new ServerError(`Couldn't find a name match for ${username}`);
  }

  if (standardize(match) !== player.username) {
    throw new ServerError(`Display name and username don't match for ${username}`);
  }

  const newDisplayName = sanitize(match);

  if (player.displayName !== newDisplayName) {
    await player.update({ displayName: newDisplayName });
  }

  return newDisplayName;
}

function getBuild(snapshot: Snapshot): string {
  if (isF2p(snapshot)) return 'f2p';
  if (isLvl3(snapshot)) return 'lvl3';
  // This must be above 1def because 10 HP accounts can also have 1 def
  if (is10HP(snapshot)) return '10hp';
  if (is1Def(snapshot)) return '1def';
  return 'main';
}

async function findOrCreate(username: string): Promise<[Player, boolean]> {
  const result = await Player.findOrCreate({
    where: { username: standardize(username) },
    defaults: { displayName: sanitize(username) }
  });

  return result;
}

async function find(username: string): Promise<Player | null> {
  const result = await Player.findOne({
    where: { username: standardize(username) }
  });

  return result;
}

async function findAllOrCreate(usernames: string[]): Promise<Player[]> {
  const promises = await Promise.all(usernames.map(username => findOrCreate(username)));
  return promises.map(p => p[0]);
}

async function findAll(usernames: string[]): Promise<Player[]> {
  const promises = await Promise.all(usernames.map(username => find(username)));

  if (!promises || !promises.length) return [];

  return promises;
}

async function findById(playerId: number): Promise<Player | null> {
  const players = await Player.findOne({
    where: { id: playerId }
  });

  return players;
}

async function findAllByIds(playerIds: number[]): Promise<Player[]> {
  const players = await Player.findAll({
    where: { id: playerIds }
  });

  return players;
}

export {
  standardize,
  sanitize,
  isValidUsername,
  findAllOrCreate,
  findAll,
  findById,
  findAllByIds,
  find,
  getDetails,
  search,
  update,
  importCML,
  assertType,
  assertName,
  shouldImport,
  resolve,
  resolveId
};
