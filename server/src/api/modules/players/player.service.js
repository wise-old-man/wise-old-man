const axios = require('axios');
const { Op } = require('sequelize');
const { isValidDate } = require('../../util/dates');
const { CML, OSRS_HISCORES } = require('../../constants/services');
const { ServerError, BadRequestError } = require('../../errors');
const { Player } = require('../../../database');
const snapshotService = require('../snapshots/snapshot.service');

const WEEK_IN_SECONDS = 604800;
const YEAR_IN_SECONDS = 31556926;
const DECADE_IN_SECONDS = 315569260;

/**
 * Format a username into a standardized version:
 *
 * "psikoi" -> "Psikoi",
 * "Hello_world  " -> "Hello World"
 */
function formatUsername(username) {
  return username
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function shouldUpdate(updatedAt) {
  if (!updatedAt || !isValidDate(updatedAt)) {
    return [true, DECADE_IN_SECONDS];
  }

  const diff = Date.now() - updatedAt.getTime();
  const seconds = Math.floor(diff / 1000);

  // Only allow the player to be updated ,
  // if he hasn't been in the last 60 seconds
  const should = seconds >= 60;

  return [should, seconds];
}

function shouldImport(lastImportedAt) {
  // If the player's CML history has never been
  // imported, should import the last years
  if (!lastImportedAt || !isValidDate(lastImportedAt)) {
    return [true, DECADE_IN_SECONDS];
  }

  const diff = Date.now() - lastImportedAt.getTime();
  const seconds = Math.floor(diff / 1000);

  // Only allow the player to be imported from CML,
  // If he hasn't been in the last 24h
  const should = seconds / 60 / 60 >= 24;

  return [should, seconds];
}

/**
 * Get the latest date on a given username. (Player info and latest snapshot)
 */
async function getData(username) {
  if (!username) {
    throw new BadRequestError('Invalid username.');
  }

  const player = await Player.findOne({
    where: { username: { [Op.like]: `${formatUsername(username)}` } }
  });

  if (!player) {
    throw new BadRequestError(`${username} is not being tracked yet.`);
  }

  const latestSnapshot = await snapshotService.findLatest(player.id);

  return { ...player.toJSON(), latestSnapshot: snapshotService.format(latestSnapshot) };
}

/**
 * Get the latest date on a given player id. (Player info and latest snapshot)
 */
async function getDataById(id) {
  if (!id) {
    throw new BadRequestError('Invalid player id.');
  }

  const player = await Player.findOne({ where: { id } });

  if (!player) {
    throw new BadRequestError(`Player of id ${id} is not being tracked yet.`);
  }

  const latestSnapshot = await snapshotService.findLatest(player.id);

  return { ...player.toJSON(), latestSnapshot: snapshotService.format(latestSnapshot) };
}

/**
 * Search for players with a (partially) matching username.
 */
async function search(username) {
  if (!username) {
    throw new BadRequestError('Invalid username.');
  }

  const players = await Player.findAll({
    where: {
      username: {
        [Op.like]: `${formatUsername(username)}%`
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
async function update(username) {
  if (!username) {
    throw new BadRequestError('Invalid username.');
  }

  // Find a player with the given username,
  // or create a new one if none are found
  const [player, created] = await findOrCreate(username);
  const [should, seconds] = await shouldUpdate(player.updatedAt);

  // If the player already existed and was updated recently,
  // don't allow the api to update it
  if (!should && !created) {
    throw new BadRequestError(`Failed to update: ${username} was updated ${seconds} seconds ago.`);
  }

  try {
    // Load data from OSRS hiscores
    const hiscoresCSV = await getHiscoresData(player.username);

    // Convert the csv data to a Snapshot instance (saved in the DB)
    const currentSnapshot = await snapshotService.fromRS(player.id, hiscoresCSV);

    // Update the "updatedAt" timestamp on the player model
    await player.changed('updatedAt', true);
    await player.save();

    return { ...player.toJSON(), latestSnapshot: snapshotService.format(currentSnapshot) };
  } catch (e) {
    // If the player was just registered and it failed to fetch hiscores,
    // set updatedAt to null to allow for re-attempts without the 60s waiting period
    if (created) {
      // Doing this with the model method (Player.update) because the
      // instance method (instance.update) doesn't seem to work.
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
async function importCML(username) {
  if (!username) {
    throw new BadRequestError('Invalid username.');
  }

  // Find a player with the given username,
  // or create a new one if none are found
  const [player] = await findOrCreate(username);
  const [should, seconds] = shouldImport(player.lastImportedAt);

  // If the player hasn't imported in over 24h,
  // attempt to import its history from CML
  if (!should) {
    const minsTilImport = Math.floor((24 * 3600 - seconds) / 60);
    throw new BadRequestError(`Imported too soon, please wait another ${minsTilImport} minutes.`);
  }

  const importedSnapshots = [];

  // If the player hasn't imported in over a year
  // import the last week, year and decade.
  if (seconds >= YEAR_IN_SECONDS) {
    const weekSnapshots = await importCMLSince(player.id, player.username, WEEK_IN_SECONDS);
    const yearSnapshots = await importCMLSince(player.id, player.username, YEAR_IN_SECONDS);
    const decadeSnapshots = await importCMLSince(player.id, player.username, DECADE_IN_SECONDS);

    importedSnapshots.push(weekSnapshots);
    importedSnapshots.push(yearSnapshots);
    importedSnapshots.push(decadeSnapshots);
  } else {
    const recentSnapshots = await importCMLSince(player.id, player.username, seconds);
    importedSnapshots.push(recentSnapshots);
  }

  // Update the "lastImportedAt" field in the player model
  await player.update({ lastImportedAt: new Date() });

  return importedSnapshots;
}

async function importCMLSince(id, username, time) {
  // Load the CML history
  const history = await getCMLHistory(username, time);

  // Convert the CML csv data to Snapshot instances
  const snapshots = await Promise.all(history.map(row => snapshotService.fromCML(id, row)));

  // Save new snapshots to db
  const savedSnapshots = await snapshotService.saveAll(snapshots);

  return savedSnapshots;
}

/**
 * Check the hiscores to check if a player
 * with a given username is of a specific player type.
 */
async function isType(username, type) {
  try {
    await getHiscoresData(username, type);
    return true;
  } catch (e) {
    // If the hiscores are down, abort mission,
    // otherwise if it's a BadRequestError,
    // then it's possible the player is not of "type"
    if (e instanceof ServerError) {
      throw e;
    }
  }

  return false;
}

/**
 * If a player type is unknown, check different
 * hiscores endpoints to try and determine it.
 */
async function confirmType(username) {
  if (!username) {
    throw new BadRequestError('Invalid username.');
  }

  const [player] = await findOrCreate(username);

  if (!player || !player.type) {
    throw new ServerError('Invalid player.');
  }

  if (player.type !== 'unknown') {
    return player.type;
  }

  let type = 'regular';

  if (await isType(player.username, 'IRONMAN')) {
    if (await isType(player.username, 'ULTIMATE_IRONMAN')) {
      type = 'ultimate';
    } else if (await isType(player.username, 'HARDCORE_IRONMAN')) {
      type = 'hardcore';
    } else {
      type = 'ironman';
    }
  }

  await player.update({ type });

  return type;
}

async function findOrCreate(username) {
  const result = await Player.findOrCreate({ where: { username: formatUsername(username) } });
  return result;
}

async function findById(id) {
  const result = await Player.findOne({ where: { id } });
  return result;
}

async function find(username) {
  const result = await Player.findOne({ where: { username: formatUsername(username) } });
  return result;
}

async function findAllOrCreate(usernames) {
  const promises = await Promise.all(usernames.map(username => findOrCreate(username)));
  return promises.map(p => p[0]);
}

async function findAll(usernames) {
  const promises = await Promise.all(usernames.map(username => find(username)));

  if (!promises || !promises.length) {
    return [];
  }

  return promises;
}

/**
 * Fetches the player history from the CML API.
 */
async function getCMLHistory(username, time) {
  const URL = `${CML.HISTORY}&player=${username}&time=${time}`;

  try {
    // Fetch the data through the API Url
    const { data } = await axios.get(URL);

    // Validate the response data
    if (!data || !data.length || data === '-1') {
      throw new Error();
    }

    // Separate the data into rows and filter invalid ones
    return data.split('\n').filter(r => r.length);
  } catch (e) {
    throw new ServerError('Failed to load history from CML.');
  }
}

/**
 * Fetches the player data from the Hiscores API.
 */
async function getHiscoresData(username, type = 'NORMAL') {
  const URL = `${OSRS_HISCORES[type]}?player=${username}`;

  try {
    // Fetch the data through the API Url
    const { data } = await axios.get(URL);

    // Validate the response data
    if (!data || !data.length || data.includes('Unavailable')) {
      throw new ServerError('Failed to load hiscores: Service is unavailable');
    }

    return data;
  } catch (e) {
    throw new BadRequestError('Failed to load hiscores: Invalid username.');
  }
}

exports.formatUsername = formatUsername;
exports.shouldUpdate = shouldUpdate;
exports.shouldImport = shouldImport;
exports.getDataById = getDataById;
exports.getData = getData;
exports.search = search;
exports.update = update;
exports.importCML = importCML;
exports.confirmType = confirmType;
exports.find = find;
exports.findById = findById;
exports.findOrCreate = findOrCreate;
exports.findAllOrCreate = findAllOrCreate;
exports.findAll = findAll;
exports.getCMLHistory = getCMLHistory;
exports.getHiscoresData = getHiscoresData;
