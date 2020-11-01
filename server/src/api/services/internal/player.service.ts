import { Op } from 'sequelize';
import { Player, Snapshot } from '../../../database/models';
import { NotFoundError, RateLimitError, ServerError } from '../../errors';
import { isValidDate } from '../../util/dates';
import { getCombatLevel, is10HP, is1Def, isF2p, isLvl3 } from '../../util/level';
import * as jagexService from '../external/jagex.service';
import * as efficiencyService from './efficiency.service';
import * as leagueService from './league.service';
import * as snapshotService from './snapshot.service';

const YEAR_IN_SECONDS = 31556926;
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
  const leagueTier = await leagueService.getPlayerTier(stats && stats.overallRank);
  const latestSnapshot = snapshotService.format(stats, efficiency);

  return { ...(player.toJSON() as any), combatLevel, leagueTier, latestSnapshot };
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
  const [should] = shouldUpdate(player);

  // If the player was updated recently, don't update it
  if (!should && !isNew) {
    throw new RateLimitError(`Error: ${username} has been updated recently.`);
  }

  try {
    // Fetch the previous player stats from the database
    const previousStats = await snapshotService.findLatest(player.id);
    // Fetch the new player stats from the hiscores API
    const currentStats = await fetchStats(player);

    // There has been a radical change in this player's stats, mark it as flagged
    if (!snapshotService.withinRange(previousStats, currentStats)) {
      await player.update({ flagged: true });
      throw new ServerError('Failed to update: Unregistered name change.');
    }

    // Refresh the player's build
    player.build = getBuild(currentStats);
    player.type = 'ironman';
    player.flagged = false;

    const virtuals = await efficiencyService.calcPlayerVirtuals(player, currentStats);
    const leagueTier = await leagueService.getPlayerTier(currentStats.overallRank);

    // Set the player's global virtual data
    player.exp = currentStats.overallExperience;
    player.ehp = virtuals.ehpValue;
    player.ehb = virtuals.ehbValue;
    player.ttm = virtuals.ttm;
    player.tt200m = virtuals.tt200m;
    player.leagueTier = leagueTier;
    player.leaguePoints = currentStats.league_pointsScore;

    // Add the virtual data and save the snapshot
    Object.assign(currentStats, virtuals);
    await currentStats.save();

    await player.changed('updatedAt', true);
    await player.save();

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

async function fetchStats(player: Player): Promise<Snapshot> {
  // Load data from OSRS hiscores
  const hiscoresCSV = await jagexService.getHiscoresData(player.username);

  // Convert the csv data to a Snapshot instance (saved in the DB)
  const newSnapshot = await snapshotService.fromRS(player.id, hiscoresCSV);

  return newSnapshot;
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
  assertName,
  resolve,
  resolveId
};
