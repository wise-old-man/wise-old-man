const axios = require('axios');
const { Op } = require('sequelize');
const { isValidDate } = require('../../util/dates');
const { CML, OSRS_HISCORES } = require('../../constants/services');
const { ServerError, BadRequestError } = require('../../errors');
const { Player } = require('../../../database');
const snapshotService = require('../snapshots/snapshot.service');
const { getNextProxy } = require('../../proxies');
const { getCombatLevel } = require('../../util/level');
const { getHiscoresTableNames } = require('../../util/scraping');

const YEAR_IN_SECONDS = 31556926;
const DECADE_IN_SECONDS = 315569260;

/**
 * Format a username into a standardized version,
 * replacing any special characters, and forcing lower case.
 *
 * "Psikoi" -> "psikoi",
 * "Hello_world  " -> "hello world"
 */
function standardize(username) {
  return username
    .replace(/[-_\s]/g, ' ')
    .trim()
    .toLowerCase();
}

function sanitize(username) {
  return username.replace(/[-_\s]/g, ' ').trim();
}

function isValidUsername(username) {
  if (typeof username !== 'string') {
    return false;
  }

  const formattedUsername = standardize(username);

  if (formattedUsername.length < 1 || formattedUsername.length > 12) {
    return false;
  }

  if (formattedUsername.startsWith(' ') || formattedUsername.endsWith(' ')) {
    return false;
  }

  if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(formattedUsername)) {
    return false;
  }

  return true;
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
async function getDetails(username) {
  if (!username) {
    throw new BadRequestError('Invalid username.');
  }

  const player = await Player.findOne({
    where: { username: { [Op.like]: `${standardize(username)}` } }
  });

  if (!player) {
    throw new BadRequestError(`${username} is not being tracked yet.`);
  }

  const latestSnapshot = await snapshotService.findLatest(player.id);
  const combatLevel = getCombatLevel(latestSnapshot);

  return { ...player.toJSON(), latestSnapshot: snapshotService.format(latestSnapshot), combatLevel };
}

/**
 * Get the latest date on a given player id. (Player info and latest snapshot)
 */
async function getDetailsById(id) {
  if (!id) {
    throw new BadRequestError('Invalid player id.');
  }

  const player = await Player.findOne({ where: { id } });

  if (!player) {
    throw new BadRequestError(`Player of id ${id} is not being tracked yet.`);
  }

  const latestSnapshot = await snapshotService.findLatest(player.id);
  const combatLevel = getCombatLevel(latestSnapshot);

  return { ...player.toJSON(), latestSnapshot: snapshotService.format(latestSnapshot), combatLevel };
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
    // If the player is new or has an unknown player type,
    // determine it before tracking
    if (player.type === 'unknown') {
      player.type = await assertType(player.username);
    }

    // Load data from OSRS hiscores
    const hiscoresCSV = await getHiscoresData(player.username, player.type);

    // Convert the csv data to a Snapshot instance (saved in the DB)
    const currentSnapshot = await snapshotService.fromRS(player.id, hiscoresCSV);
    const formattedSnapshot = snapshotService.format(currentSnapshot);

    // Update the "updatedAt" timestamp on the player model
    await player.changed('updatedAt', true);
    await player.save();

    const formatted = { ...player.toJSON(), latestSnapshot: formattedSnapshot };

    return [formatted, created];
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
  // import the last year and decade.
  if (seconds >= YEAR_IN_SECONDS) {
    const yearSnapshots = await importCMLSince(player.id, player.username, YEAR_IN_SECONDS);
    const decadeSnapshots = await importCMLSince(player.id, player.username, DECADE_IN_SECONDS);

    importedSnapshots.push(...yearSnapshots);
    importedSnapshots.push(...decadeSnapshots);
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

  // Ignore any CML snapshots past May 10th 2020 (when we introduced boss tracking)
  const pastSnapshots = snapshots.filter(s => s.createdAt < new Date('2020-05-10'));

  // Save new snapshots to db
  const savedSnapshots = await snapshotService.saveAll(pastSnapshots);

  return savedSnapshots;
}

/**
 * Gets a player's overall experience in a specific
 * player type hiscores endpoint.
 *
 * Note: This is an auxilary function for the assertType function
 * and should not be used for any other situation.
 */
async function getOverallExperience(username, type) {
  try {
    const data = await getHiscoresData(username, type);

    if (!data || data.length === 0) {
      throw new ServerError('Failed to fetch hiscores data.');
    }

    const rows = data.split('\n');

    if (!rows || rows.length === 0) {
      throw new ServerError('Failed to fetch hiscores data.');
    }

    const values = rows[0].split(',');

    if (values.length < 3) {
      throw new ServerError('Failed to fetch hiscores data.');
    }

    return parseInt(values[2], 10);
  } catch (e) {
    if (e instanceof ServerError) {
      throw e;
    }
    return -1;
  }
}

/**
 * Query the multiple hiscore endpoints to try and determine
 * the player's account type.
 *
 * If force is true, this will reassign the type, even if the current
 * value is not unknown.
 *
 * Note: If an hardcore acc dies at 1m overall exp, it stays that way in the
 * hardcore hiscores, even if the regular ironman hiscores continue to progress.
 * So to check if the player is no longer hardcore, we have to check if the
 * ironman exp is higher than the hardcore exp (meaning it progressed further as an ironman)
 */
async function assertType(username, force = false) {
  async function submitType(player, type) {
    if (player.type === type) {
      throw new BadRequestError(`Failed to reassign player type: ${username}'s is already ${type}.`);
    }

    await player.update({ type });
  }

  if (!username) {
    throw new BadRequestError('Invalid username.');
  }

  const formattedUsername = standardize(username);
  const player = await find(formattedUsername);

  if (!player) {
    throw new BadRequestError(`Invalid player: ${username} is not being tracked yet.`);
  }

  if (!force && player.type !== 'unknown') {
    return player.type;
  }

  const regularExp = await getOverallExperience(formattedUsername, 'regular');

  if (regularExp === -1) {
    throw new BadRequestError(`Failed to load hiscores for ${username}.`);
  }

  const ironmanExp = await getOverallExperience(formattedUsername, 'ironman');

  if (ironmanExp < regularExp) {
    await submitType(player, 'regular');
    return 'regular';
  }

  const hardcoreExp = await getOverallExperience(formattedUsername, 'hardcore');

  if (hardcoreExp >= ironmanExp) {
    await submitType(player, 'hardcore');
    return 'hardcore';
  }

  const ultimateExp = await getOverallExperience(formattedUsername, 'ultimate');

  if (ultimateExp >= ironmanExp) {
    await submitType(player, 'ultimate');
    return 'ultimate';
  }

  await submitType(player, 'ironman');
  return 'ironman';
}

/**
 * Fetch the hiscores table overall to find the correct
 * capitalization of a given username
 */
async function assertName(username) {
  if (!username) {
    throw new BadRequestError('Invalid username.');
  }

  const formattedUsername = standardize(username);
  const player = await find(formattedUsername);

  if (!player) {
    throw new BadRequestError(`Invalid player: ${username} is not being tracked yet.`);
  }

  const hiscoresNames = await getHiscoresNames(username);
  const match = hiscoresNames.find(h => standardize(h) === username);

  if (!match) {
    throw new BadRequestError(`Couldn't find a name match for ${username}`);
  }

  if (standardize(match) !== player.username) {
    throw new BadRequestError(`Display name and username don't match for ${username}`);
  }

  const displayName = sanitize(match);

  if (displayName === player.displayName) {
    throw new BadRequestError(`No change required: The current display name is correct.`);
  }

  await player.update({ displayName });
  return displayName;
}

async function findOrCreate(username) {
  const result = await Player.findOrCreate({
    where: { username: standardize(username) },
    defaults: { displayName: sanitize(username) }
  });

  return result;
}

async function find(username) {
  const result = await Player.findOne({ where: { username: standardize(username) } });
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
async function getHiscoresData(username, type = 'regular') {
  const proxy = getNextProxy();
  const URL = `${OSRS_HISCORES[type]}?player=${username}`;

  try {
    // Fetch the data through the API Url
    const { data } = await axios({ url: proxy ? URL.replace('https', 'http') : URL, proxy });

    // Validate the response data
    if (!data || !data.length || data.includes('Unavailable')) {
      throw new ServerError('Failed to load hiscores: Service is unavailable');
    }

    return data;
  } catch (e) {
    throw new BadRequestError('Failed to load hiscores: Invalid username.');
  }
}

async function getHiscoresNames(username) {
  const proxy = getNextProxy();
  const URL = `${OSRS_HISCORES.nameCheck}&user=${username}`;

  try {
    // Fetch the data through the API Url
    const { data } = await axios({
      url: proxy ? URL.replace('https', 'http') : URL,
      proxy,
      responseType: 'arraybuffer',
      reponseEncoding: 'binary'
    });

    // Validate the response data
    if (!data || !data.length || data.includes('Unavailable')) {
      throw new ServerError('Failed to load hiscores: Service is unavailable');
    }

    return getHiscoresTableNames(data.toString('latin1'));
  } catch (e) {
    throw new BadRequestError('Failed to load hiscores: Invalid username.');
  }
}

// Utils
exports.standardize = standardize;
exports.sanitize = sanitize;
exports.isValidUsername = isValidUsername;
exports.findAllOrCreate = findAllOrCreate;
exports.findAll = findAll;

// Handlers
exports.getDetailsById = getDetailsById;
exports.getDetails = getDetails;
exports.search = search;
exports.update = update;
exports.importCML = importCML;
exports.assertType = assertType;
exports.assertName = assertName;
