import { findCountry } from '@wise-old-man/utils';
import { Op } from 'sequelize';
import { Player, Snapshot } from '../../../database/models';
import { PlayerTypeEnum, Player as PlayerModel } from '../../../prisma';
import { BadRequestError, NotFoundError, RateLimitError, ServerError } from '../../errors';
import { getCombatLevel } from '../../util/experience';
import * as cmlService from '../external/cml.service';
import * as jagexService from '../external/jagex.service';
import * as playerServices from '../../modules/players/player.services';
import * as playerUtils from '../../modules/players/player.utils';
import * as snapshotService from './snapshot.service';
import * as snapshotServices from '../../modules/snapshots/snapshot.services';
import * as snapshotUtils from '../../modules/snapshots/snapshot.utils';
import * as efficiencyUtils from '../../modules/efficiency/efficiency.utils';
import * as efficiencyServices from '../../modules/efficiency/efficiency.services';

const YEAR_IN_SECONDS = 31_556_926;
const DECADE_IN_SECONDS = YEAR_IN_SECONDS * 10;

interface PlayerResolvable {
  id?: number;
  username?: string;
}

interface PlayerDetails extends PlayerModel {
  combatLevel: number;
  latestSnapshot: any;
}

async function resolve(playerResolvable: PlayerResolvable): Promise<PlayerModel> {
  let player: PlayerModel;

  if (playerResolvable.id) {
    player = (await playerServices.findPlayer({ id: playerResolvable.id }))[0];
  } else if (playerResolvable.username) {
    player = (await playerServices.findPlayer({ username: playerResolvable.username }))[0];
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
async function getDetails(player: PlayerModel, snapshot?: Snapshot): Promise<PlayerDetails> {
  const stats = snapshot || (await snapshotServices.findPlayerSnapshot({ id: player.id }));

  const efficiency = stats && efficiencyUtils.getPlayerEfficiencyMap(stats, player as any);
  const combatLevel = getCombatLevel(stats as any);

  const latestSnapshot = snapshotUtils.format(stats, efficiency);

  return { ...player, combatLevel, latestSnapshot };
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
  const [player, isNew] = await playerServices.findPlayer({ username, createIfNotFound: true });

  // If the player was updated recently, don't update it
  if (!playerUtils.shouldUpdate(player) && !isNew) {
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
      await Player.update({ flagged: true }, { where: { id: player.id } });

      throw new ServerError('Failed to update: Unregistered name change.');
    }

    // The player has gained exp/kc/scores since the last update
    if (snapshotUtils.hasChanged(previousStats, currentStats)) {
      player.lastChangedAt = new Date();
      currentStats.isChange = true;
    }

    // Refresh the player's build
    player.build = playerUtils.getBuild(currentStats);
    player.flagged = false;

    const virtuals = await efficiencyServices.computePlayerVirtuals({
      player,
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

    await Player.update({ ...player, updatedAt: new Date() }, { where: { id: player.id } });

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
async function importCML(
  player: Pick<PlayerModel, 'id' | 'lastImportedAt' | 'username'>
): Promise<Snapshot[]> {
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
  await Player.update({ lastImportedAt: new Date() }, { where: { id: player.id } });

  return importedSnapshots;
}

async function importCMLSince(
  player: Pick<PlayerModel, 'id' | 'username'>,
  time: number
): Promise<Snapshot[]> {
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

async function fetchStats(
  player: Pick<PlayerModel, 'id' | 'username' | 'type'>,
  type?: PlayerTypeEnum
): Promise<Snapshot> {
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
async function getOverallExperience(
  player: Pick<PlayerModel, 'id' | 'username' | 'type'>,
  type: PlayerTypeEnum
): Promise<number | null> {
  try {
    return (await fetchStats(player, type)).overallExperience;
  } catch (e) {
    if (e instanceof ServerError) throw e;
    return null;
  }
}

async function getType(
  player: Pick<PlayerModel, 'id' | 'username' | 'type' | 'displayName'>
): Promise<PlayerTypeEnum> {
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
async function assertType(
  player: Pick<PlayerModel, 'id' | 'username' | 'type' | 'displayName' | 'flagged'>
): Promise<string> {
  if (player.flagged) {
    throw new BadRequestError('Type Assertion Not Allowed: Player is Flagged.');
  }

  const type = await getType(player);

  if (player.type !== type) {
    await Player.update({ type }, { where: { id: player.id } });
  }

  return type;
}

async function updateCountry(player: PlayerModel, country: string) {
  const countryObj = country ? findCountry(country) : null;
  const countryCode = countryObj?.code;

  if (country && !countryCode) {
    throw new BadRequestError(
      `Invalid country. You must either supply a valid code or name, according to the ISO 3166-1 standard. \
      Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
    );
  }

  await Player.update({ country: countryCode }, { where: { id: player.id } });

  return countryObj;
}

export { getDetails, search, update, importCML, assertType, updateCountry, resolve, resolveId };
