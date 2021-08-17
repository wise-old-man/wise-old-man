import { Op } from 'sequelize';
import { Player, Snapshot } from '../../../database/models';
import { BadRequestError, NotFoundError, RateLimitError, ServerError } from '../../errors';
import { isValidDate } from '../../util/dates';
import { getCombatLevel, is10HP, is1Def, isF2p, isLvl3, isZerker } from '../../util/experience';
import * as cmlService from '../external/cml.service';
import * as geoService from '../external/geo.service';
import * as jagexService from '../external/jagex.service';
import logger from '../external/logger.service';
import redisService from '../external/redis.service';
import * as efficiencyService from './efficiency.service';
import * as snapshotService from './snapshot.service';

const DAY_IN_SECONDS = 86_400;
const YEAR_IN_SECONDS = 31_556_926;
const DECADE_IN_SECONDS = YEAR_IN_SECONDS * 10;

interface PlayerResolvable {
  id?: number;
  username?: string;
}

interface PlayerDetails extends Player {
  combatLevel: number;
  latestSnapshot: any;
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

  // If doesn't meet the size requirements
  if (standardized.length < 1 || standardized.length > 12) return false;

  // If starts or ends with a space
  if (standardized.startsWith(' ') || standardized.endsWith(' ')) return false;

  // If has any special characters
  if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(standardized)) return false;

  return true;
}

/**
 * Checks if a given player should have their player type reviewed.
 * This is useful to periodically re-check iron players' acc types. Incase of de-ironing.
 */
async function shouldReviewType(player: Player): Promise<boolean> {
  const { username, type, lastChangedAt } = player;

  // Type reviews should only be done on iron players
  if (type === 'regular' || type === 'unknown') return false;

  // After checking a player's type, we add their username to a cache that blocks
  // this action to be repeated again within the next week (as to not overload the server)
  const hasCooldown = !!(await redisService.getValue('cd:PlayerTypeReview', username));

  // If player hasn't gained exp in over 24h, despite being updated recently
  const isInactive = !lastChangedAt || (Date.now() - lastChangedAt.getTime()) / 1000 > DAY_IN_SECONDS;

  return !hasCooldown && isInactive;
}

/**
 * Checks if a given player has been updated in the last 60 seconds.
 */
function shouldUpdate(player: Player): boolean {
  if (!player.updatedAt || !isValidDate(player.updatedAt)) return true;
  return Math.floor((Date.now() - player.updatedAt.getTime()) / 1000) >= 60;
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
  const stats = snapshot || (await snapshotService.findLatest(player.id));
  const efficiency = stats && efficiencyService.calcSnapshotVirtuals(player, stats);
  const combatLevel = getCombatLevel(stats);

  const latestSnapshot = snapshotService.format(stats, efficiency);

  return { ...(player.toJSON() as any), combatLevel, latestSnapshot };
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

  // If the player was updated recently, don't update it
  if (!shouldUpdate(player) && !isNew) {
    throw new RateLimitError(`Error: ${username} has been updated recently.`);
  }

  try {
    // Always determine the rank before tracking (to fetch correct ranks)
    if (player.type === 'unknown') {
      player.type = await getType(player);
    }

    // Fetch the previous player stats from the database
    const previousStats = await snapshotService.findLatest(player.id);
    // Fetch the new player stats from the hiscores API
    const currentStats = await fetchStats(player);

    // There has been a radical change in this player's stats, mark it as flagged
    if (!snapshotService.withinRange(previousStats, currentStats)) {
      await player.update({ flagged: true });
      throw new ServerError('Failed to update: Unregistered name change.');
    }

    // The player has gained exp/kc/scores since the last update
    if (snapshotService.hasChanged(previousStats, currentStats)) {
      player.lastChangedAt = new Date();
      currentStats.isChange = true;
    }

    // Refresh the player's build
    player.build = getBuild(currentStats);
    player.flagged = false;

    const virtuals = await efficiencyService.calcPlayerVirtuals(player, currentStats);

    // Set the player's global virtual data
    player.exp = currentStats.overallExperience;
    player.ehp = virtuals.ehpValue;
    player.ehb = virtuals.ehbValue;
    player.ttm = virtuals.ttm;
    player.tt200m = virtuals.tt200m;

    // Add the virtual data and save the snapshot
    Object.assign(currentStats, virtuals);

    await player.changed('updatedAt', true);
    await player.save();

    await currentStats.save();

    const playerDetails = await getDetails(player, currentStats);

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
async function getOverallExperience(player: Player, type: string): Promise<number | null> {
  try {
    return (await fetchStats(player, type)).overallExperience;
  } catch (e) {
    if (e instanceof ServerError) throw e;
    logger.debug(`Failed ${type}`, { id: player.id, username: player.username, error: e });
    return null;
  }
}

async function getType(player: Player): Promise<string> {
  const regularExp = await getOverallExperience(player, 'regular');
  logger.debug(`Checking regular ${regularExp}`, { id: player.id, username: player.username });

  // This username is not on the hiscores
  if (!regularExp) {
    throw new BadRequestError(`Failed to load hiscores for ${player.displayName}.`);
  }

  const ironmanExp = await getOverallExperience(player, 'ironman');
  logger.debug(`Checking ironman ${ironmanExp}`, { id: player.id, username: player.username });
  if (!ironmanExp || ironmanExp < regularExp) return 'regular';

  const hardcoreExp = await getOverallExperience(player, 'hardcore');
  logger.debug(`Checking hardcore ${hardcoreExp}`, { id: player.id, username: player.username });
  if (hardcoreExp && hardcoreExp >= ironmanExp) return 'hardcore';

  const ultimateExp = await getOverallExperience(player, 'ultimate');
  logger.debug(`Checking ultimate ${ultimateExp}`, { id: player.id, username: player.username });
  if (ultimateExp && ultimateExp >= ironmanExp) return 'ultimate';

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

async function updateCountry(player: Player, country: string) {
  const countryObj = country ? geoService.find(country) : null;
  const countryCode = countryObj?.code;

  if (country && !countryCode) {
    throw new BadRequestError(
      `Invalid country. You must either supply a valid code or name, according to the ISO 3166-1 standard. \
      Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
    );
  }

  await player.update({ country: countryCode });
  return countryObj;
}

function getBuild(snapshot: Snapshot): string {
  if (isF2p(snapshot)) return 'f2p';
  if (isLvl3(snapshot)) return 'lvl3';
  // This must be above 1def because 10 HP accounts can also have 1 def
  if (is10HP(snapshot)) return '10hp';
  if (is1Def(snapshot)) return '1def';
  if (isZerker(snapshot)) return 'zerker';
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
  const foundPlayers = await findAll(usernames);
  if (foundPlayers.length === usernames.length) return foundPlayers;

  // Find the already registered usernames
  const foundUsernames = foundPlayers.map(f => f.username);

  // Find the unregistered usernames
  const missingUsernames = usernames.filter(u => !foundUsernames.includes(standardize(u)));

  const newPlayers = await Player.bulkCreate(
    missingUsernames.map(m => ({ username: standardize(m), displayName: sanitize(m) })),
    { individualHooks: true }
  );

  // Sort the resulting players list by the order of the input usernames
  const standardizedUsernames = usernames.map(standardize);
  return [...foundPlayers, ...newPlayers].sort(
    (a, b) => standardizedUsernames.indexOf(a.username) - standardizedUsernames.indexOf(b.username)
  );
}

async function findAll(usernames: string[]): Promise<Player[]> {
  const standardizedUsernames = usernames.map(standardize);

  const players = await Player.findAll({ where: { username: standardizedUsernames } });

  return players.sort(
    (a, b) => standardizedUsernames.indexOf(a.username) - standardizedUsernames.indexOf(b.username)
  );
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
  updateCountry,
  shouldImport,
  shouldReviewType,
  resolve,
  resolveId
};
