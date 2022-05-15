import { findCountry } from '@wise-old-man/utils';
import { isTesting } from '../../../env';
import { Op } from 'sequelize';
import { Player, Snapshot } from '../../../database/models';
import { PlayerBuildEnum, PlayerTypeEnum } from '../../../prisma';
import { BadRequestError, NotFoundError, RateLimitError, ServerError } from '../../errors';
import { isValidDate } from '../../util/dates';
import { getCombatLevel, is10HP, is1Def, isF2p, isLvl3, isZerker } from '../../util/experience';
import * as cmlService from '../external/cml.service';
import * as jagexService from '../external/jagex.service';
import * as playerUtils from '../../modules/players/player.utils';
import * as snapshotService from './snapshot.service';
import * as snapshotServices from '../../modules/snapshots/snapshot.services';
import * as snapshotUtils from '../../modules/snapshots/snapshot.utils';
import * as efficiencyUtils from '../../modules/efficiency/efficiency.utils';
import * as efficiencyServices from '../../modules/efficiency/efficiency.services';

const YEAR_IN_SECONDS = 31_556_926;
const DECADE_IN_SECONDS = YEAR_IN_SECONDS * 10;

let UPDATE_COOLDOWN = isTesting() ? 0 : 60;

interface PlayerResolvable {
  id?: number;
  username?: string;
}

interface PlayerDetails extends Player {
  combatLevel: number;
  latestSnapshot: any;
}

// For integration testing purposes
export function setUpdateCooldown(seconds: number) {
  UPDATE_COOLDOWN = seconds;
}

/**
 * Checks if a given player has been updated in the last 60 seconds.
 */
function shouldUpdate(player: Player): boolean {
  if (!player.updatedAt || !isValidDate(player.updatedAt)) return true;

  const timeSinceLastUpdate = Math.floor((Date.now() - player.updatedAt.getTime()) / 1000);
  const timeSinceRegistration = Math.floor((Date.now() - player.registeredAt.getTime()) / 1000);

  return timeSinceLastUpdate >= UPDATE_COOLDOWN || (timeSinceRegistration <= 60 && !player.lastChangedAt);
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
  const stats = snapshot || (await snapshotServices.findPlayerSnapshot({ id: player.id }));

  const efficiency = stats && efficiencyUtils.getPlayerEfficiencyMap(stats, player as any);
  const combatLevel = getCombatLevel(stats as any);

  const latestSnapshot = snapshotUtils.format(stats, efficiency);

  return { ...(player.toJSON() as any), combatLevel, latestSnapshot };
}

/**
 * Search for players with a (partially) matching username.
 */
async function search(username: string): Promise<Player[]> {
  const players = await Player.findAll({
    where: {
      username: {
        [Op.like]: `${playerUtils.standardize(username)}%`
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
    if (player.type === PlayerTypeEnum.UNKNOWN) {
      player.type = await getType(player);
    }

    // Fetch the previous player stats from the database
    const previousStats = await snapshotServices.findPlayerSnapshot({ id: player.id });

    // Fetch the new player stats from the hiscores API
    const currentStats = await fetchStats(player);

    // There has been a radical change in this player's stats, mark it as flagged
    if (!snapshotUtils.withinRange(previousStats, currentStats)) {
      await player.update({ flagged: true });
      throw new ServerError('Failed to update: Unregistered name change.');
    }

    // The player has gained exp/kc/scores since the last update
    if (snapshotUtils.hasChanged(previousStats, currentStats)) {
      player.lastChangedAt = new Date();
      currentStats.isChange = true;
    }

    // Refresh the player's build
    player.build = getBuild(currentStats);
    player.flagged = false;

    const virtuals = await efficiencyServices.computePlayerVirtuals({
      player: player as any,
      snapshot: currentStats
    });

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
    if (isNew && player.type !== PlayerTypeEnum.UNKNOWN) {
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
  const [should, seconds] = playerUtils.shouldImport(player.lastImportedAt);

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
  const snapshots = await Promise.all(history.map(row => snapshotService.legacy_fromCML(player.id, row)));

  // Ignore any CML snapshots past May 10th 2020 (when we introduced boss tracking)
  const pastSnapshots = snapshots.filter((s: any) => s.createdAt < new Date('2020-05-10'));

  // Save new snapshots to db
  const savedSnapshots = await snapshotService.saveAll(pastSnapshots);

  return savedSnapshots;
}

async function fetchStats(player: Player, type?: PlayerTypeEnum): Promise<Snapshot> {
  // Load data from OSRS hiscores
  const hiscoresCSV = await jagexService.getHiscoresData(player.username, (type || player.type) as any);

  // Convert the csv data to a Snapshot instance (saved in the DB)
  const newSnapshot = await snapshotService.legacy_fromRS(player.id, hiscoresCSV);

  return newSnapshot;
}

/**
 * Gets a player's overall exp in a specific hiscores endpoint.
 * Note: This is an auxilary function for the getType function.
 */
async function getOverallExperience(player: Player, type: PlayerTypeEnum): Promise<number | null> {
  try {
    return (await fetchStats(player, type)).overallExperience;
  } catch (e) {
    if (e instanceof ServerError) throw e;
    return null;
  }
}

async function getType(player: Player): Promise<PlayerTypeEnum> {
  const regularExp = await getOverallExperience(player, PlayerTypeEnum.REGULAR);

  // This username is not on the hiscores
  if (!regularExp) {
    throw new BadRequestError(`Failed to load hiscores for ${player.displayName}.`);
  }

  const ironmanExp = await getOverallExperience(player, PlayerTypeEnum.IRONMAN);
  if (!ironmanExp || ironmanExp < regularExp) return PlayerTypeEnum.REGULAR;

  const hardcoreExp = await getOverallExperience(player, PlayerTypeEnum.HARDCORE);
  if (hardcoreExp && hardcoreExp >= ironmanExp) return PlayerTypeEnum.HARDCORE;

  const ultimateExp = await getOverallExperience(player, PlayerTypeEnum.ULTIMATE);
  if (ultimateExp && ultimateExp >= ironmanExp) return PlayerTypeEnum.ULTIMATE;

  return PlayerTypeEnum.IRONMAN;
}

/**
 * Fetch various hiscores endpoints to find the correct player type of a given player.
 */
async function assertType(player: Player): Promise<string> {
  if (player.flagged) {
    throw new BadRequestError('Type Assertion Not Allowed: Player is Flagged.');
  }

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
  const match = hiscoresNames.find(h => playerUtils.standardize(h) === username);

  if (!match) {
    throw new ServerError(`Couldn't find a name match for ${username}`);
  }

  if (playerUtils.standardize(match) !== player.username) {
    throw new ServerError(`Display name and username don't match for ${username}`);
  }

  const newDisplayName = playerUtils.sanitize(match);

  if (player.displayName !== newDisplayName) {
    await player.update({ displayName: newDisplayName });
  }

  return newDisplayName;
}

async function updateCountry(player: Player, country: string) {
  const countryObj = country ? findCountry(country) : null;
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

function getBuild(snapshot: Snapshot): PlayerBuildEnum {
  if (isF2p(snapshot)) return PlayerBuildEnum.F2P;
  if (isLvl3(snapshot)) return PlayerBuildEnum.LVL3;
  // This must be above 1def because 10 HP accounts can also have 1 def
  if (is10HP(snapshot)) return PlayerBuildEnum.HP10;
  if (is1Def(snapshot)) return PlayerBuildEnum.DEF1;
  if (isZerker(snapshot)) return PlayerBuildEnum.ZERKER;

  return PlayerBuildEnum.MAIN;
}

async function findOrCreate(username: string): Promise<[Player, boolean]> {
  const result = await Player.findOrCreate({
    where: { username: playerUtils.standardize(username) },
    defaults: { displayName: playerUtils.sanitize(username) }
  });

  return result;
}

async function find(username: string): Promise<Player | null> {
  const result = await Player.findOne({
    where: { username: playerUtils.standardize(username) }
  });

  return result;
}

async function findById(playerId: number): Promise<Player | null> {
  const players = await Player.findOne({
    where: { id: playerId }
  });

  return players;
}

export {
  findById,
  find,
  getDetails,
  search,
  update,
  importCML,
  assertType,
  assertName,
  updateCountry,
  resolve,
  resolveId
};
