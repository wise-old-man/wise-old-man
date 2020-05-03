const _ = require('lodash');
const { Op } = require('sequelize');
const { ALL_METRICS } = require('../../constants/metrics');
const STATUSES = require('../../constants/statuses.json');
const { Competition, Participation, Player, Snapshot, Group } = require('../../../database');
const { durationBetween, isValidDate, isPast } = require('../../util/dates');
const { generateVerification, verifyCode } = require('../../util/verification');
const { BadRequestError } = require('../../errors');
const playerService = require('../players/player.service');
const snapshotService = require('../snapshots/snapshot.service');
const groupService = require('../groups/group.service');

function sanitizeTitle(title) {
  return title
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/ +(?= )/g, '')
    .trim();
}

function format(competition) {
  return _.omit(competition.toJSON(), ['verificationHash']);
}

function shouldUpdateAll(updatedAllAt) {
  if (!updatedAllAt || !isValidDate(updatedAllAt)) {
    return [true, 600000];
  }

  const diff = Date.now() - updatedAllAt.getTime();
  const seconds = Math.floor(diff / 1000);

  // Only allow the updating of all participants,
  // if it hasn't been done the last 600 seconds (10 minutes)
  const should = seconds >= 600;

  return [should, seconds];
}

/**
 * Returns a list of all competitions that
 * match the query parameters (title, status, metric).
 */
async function list(title, status, metric) {
  // The status is optional, however if present, should be valid
  if (status && !STATUSES.includes(status.toLowerCase())) {
    throw new BadRequestError(`Invalid status.`);
  }

  // The metric is optional, however if present, should be valid
  if (metric && !ALL_METRICS.includes(metric.toLowerCase())) {
    throw new BadRequestError(`Invalid metric.`);
  }

  const query = {};

  if (title) {
    query.title = { [Op.iLike]: `%${sanitizeTitle(title)}%` };
  }

  if (metric) {
    query.metric = metric.toLowerCase();
  }

  if (status) {
    const formattedStatus = status.toLowerCase();
    const now = new Date();

    if (formattedStatus === 'finished') {
      query.endsAt = { [Op.lt]: now };
    } else if (formattedStatus === 'upcoming') {
      query.startsAt = { [Op.gt]: now };
    } else if (formattedStatus === 'ongoing') {
      query.startsAt = { [Op.lt]: now };
      query.endsAt = { [Op.gt]: now };
    }
  }

  const competitions = await Competition.findAll({ where: query, limit: 20 });

  const formattedCompetitions = competitions.map(c => {
    return { ...format(c), duration: durationBetween(c.startsAt, c.endsAt) };
  });

  return formattedCompetitions;
}

/**
 * Returns a list of all competitions for a specific group.
 */
async function findForGroup(groupId) {
  const competitions = await Competition.findAll({ where: { groupId } });

  const formattedCompetitions = competitions.map(c => {
    return { ...format(c), duration: durationBetween(c.startsAt, c.endsAt) };
  });

  return formattedCompetitions;
}

/**
 * Find all competitions that a given player is participating in. (Or has participated)
 */
async function findForPlayer(playerId) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player id.`);
  }

  const participations = await Participation.findAll({
    where: { playerId },
    attributes: [],
    include: [{ model: Competition }]
  });

  const formattedCompetitions = participations.map(({ competition }) => {
    return {
      ...format(competition),
      duration: durationBetween(competition.startsAt, competition.endsAt)
    };
  });

  return formattedCompetitions;
}

/**
 * Get all the data on a given competition.
 */
async function view(id) {
  if (!id) {
    throw new BadRequestError('Invalid competition id.');
  }

  const competition = await Competition.findOne({
    where: { id },
    include: [{ model: Group }]
  });

  if (!competition) {
    throw new BadRequestError(`Competition of id ${id} was not found.`);
  }

  const metricKey = `${competition.metric}Experience`;
  const duration = durationBetween(competition.startsAt, competition.endsAt);
  const group = competition.group ? groupService.format(competition.group) : null;

  // Fetch all participations, including their players and snapshots
  const participations = await Participation.findAll({
    where: { competitionId: id },
    include: [
      { model: Player },
      { model: Snapshot, as: 'startSnapshot' },
      { model: Snapshot, as: 'endSnapshot' }
    ]
  });

  // Format the participants, and sort them (by descending delta)
  const participants = participations
    .map(({ player, startSnapshot, endSnapshot }) => {
      const start = startSnapshot ? startSnapshot[metricKey] : 0;
      const end = endSnapshot ? endSnapshot[metricKey] : 0;
      const delta = end - start;

      return {
        id: player.id,
        username: player.username,
        type: player.type,
        updatedAt: player.updatedAt,
        progress: { start, end, delta },
        history: []
      };
    })
    .sort((a, b) => b.progress.delta - a.progress.delta);

  // Select the top 10 players
  const top10Ids = participants.slice(0, 10).map(p => p.id);

  // Select all snapshots for the top 10 players, created during the competition
  const raceSnapshots = await snapshotService.findAllBetween(
    top10Ids,
    competition.startsAt,
    competition.endsAt
  );

  // Map the snapshots into a simpler format
  const raceData = raceSnapshots.map(s => ({
    createdAt: s.createdAt,
    playerId: s.playerId,
    value: s[metricKey]
  }));

  // Add all "race data" to their respective players' history
  raceData.forEach(d => {
    const player = participants.find(p => p.id === d.playerId);
    if (player) {
      player.history.push({ date: d.createdAt, value: d.value });
    }
  });

  // Sum all gained values
  const totalGained =
    participants &&
    participants.length &&
    participants.map(p => p.progress.delta).reduce((a, c) => a + c);

  return { ...format(competition), duration, totalGained, participants, group };
}

/**
 * Create a new competition.
 *
 * Note: if a groupId is given, the participants will be
 * the group's members, and the "participants" argument will be ignored.
 */
async function create(title, metric, startsAt, endsAt, groupId, participants) {
  if (!title) {
    throw new BadRequestError('Invalid competition title.');
  }

  if (!metric) {
    throw new BadRequestError('Invalid competition metric.');
  }

  if (!startsAt || !isValidDate(startsAt)) {
    throw new BadRequestError('Invalid start date.');
  }

  if (!endsAt || !isValidDate(endsAt)) {
    throw new BadRequestError('Invalid end date.');
  }

  if (isPast(startsAt) || isPast(endsAt)) {
    throw new BadRequestError('Invalid dates: All start and end dates must be in the future.');
  }

  if (groupId) {
    const group = await groupService.findOne(groupId);

    if (!group) {
      throw new BadRequestError('Invalid group id.');
    }
  }

  // Check if every username in the list is valid
  if (participants && participants.length > 0) {
    for (let i = 0; i < participants.length; i += 1) {
      if (!playerService.isValidUsername(participants[i])) {
        throw new BadRequestError(`Invalid player username: ${participants[i]}`);
      }
    }
  }
  const [verificationCode, verificationHash] = await generateVerification();
  const sanitizedTitle = sanitizeTitle(title);

  const competition = await Competition.create({
    title: sanitizedTitle,
    metric: metric.toLowerCase(),
    verificationCode,
    verificationHash,
    startsAt,
    endsAt,
    groupId
  });

  if (!groupId && !participants) {
    return { ...format(competition), participants: [] };
  }

  const newParticipants = groupId
    ? await addAllGroupMembers(competition, groupId)
    : await setParticipants(competition, participants);

  return { ...format(competition), participants: newParticipants };
}

/**
 * Edit a competition
 *
 * Note: If "participants" is defined, it will replace the existing participants.
 */
async function edit(id, title, metric, startsAt, endsAt, participants, verificationCode) {
  if (!id) {
    throw new BadRequestError('Invalid competition id.');
  }

  if (!verificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  if (endsAt && !isValidDate(endsAt)) {
    throw new BadRequestError('Invalid end date.');
  }

  if (startsAt && !isValidDate(startsAt)) {
    throw new BadRequestError('Invalid start date.');
  }

  const competition = await Competition.findOne({ where: { id } });

  if (!competition) {
    throw new BadRequestError(`Competition of id ${id} was not found.`);
  }

  if (isPast(competition.startsAt) && metric && metric.toLowerCase() !== competition.metric) {
    throw new BadRequestError(`The competition has started, the metric cannot be changed.`);
  }

  if (isPast(competition.startsAt) && startsAt && startsAt !== competition.startsAt) {
    throw new BadRequestError(`The competition has started, the start date cannot be changed.`);
  }

  const verified = await verifyCode(competition.verificationHash, verificationCode);

  if (!verified) {
    throw new BadRequestError('Incorrect verification code.');
  }

  const newValues = {};

  if (title) {
    newValues.title = sanitizeTitle(title);
  }

  if (metric) {
    newValues.metric = metric;
  }

  if (startsAt) {
    newValues.startsAt = startsAt;
  }

  if (endsAt) {
    newValues.endsAt = endsAt;
  }

  if (participants) {
    // Check if every username in the list is valid
    for (let i = 0; i < participants.length; i += 1) {
      if (!playerService.isValidUsername(participants[i])) {
        throw new BadRequestError(`Invalid player username: ${participants[i]}`);
      }
    }

    const newParticipants = await setParticipants(competition, participants);
    return { ...format(competition), participants: newParticipants };
  }

  await competition.update(newValues);

  const participations = await competition.getParticipants();

  return {
    ...format(competition),
    participants: participations.map(p => ({ ...p.toJSON(), participations: undefined }))
  };
}

/**
 * Permanently delete a competition and all associated participations.
 */
async function destroy(id, verificationCode) {
  if (!id) {
    throw new BadRequestError('Invalid competition id.');
  }

  if (!verificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  const competition = await Competition.findOne({ where: { id } });
  const { title } = competition;

  if (!competition) {
    throw new BadRequestError(`Competition of id ${id} was not found.`);
  }

  const verified = await verifyCode(competition.verificationHash, verificationCode);

  if (!verified) {
    throw new BadRequestError('Incorrect verification code.');
  }

  await competition.destroy();
  return title;
}

/**
 * Set the participants of a competition.
 *
 * This will replace any existing participants.
 */
async function setParticipants(competition, usernames) {
  if (!competition) {
    throw new BadRequestError(`Invalid competition.`);
  }

  const existingParticipants = await competition.getParticipants();
  const existingUsernames = existingParticipants.map(e => e.username);

  const usernamesToAdd = usernames.filter(u => !existingUsernames.includes(u));

  const playersToRemove = existingParticipants.filter(p => !usernames.includes(p.username));
  const playersToAdd = await playerService.findAllOrCreate(usernamesToAdd);

  if (playersToRemove && playersToRemove.length > 0) {
    await competition.removeParticipants(playersToRemove);
  }

  if (playersToAdd && playersToAdd.length > 0) {
    await competition.addParticipants(playersToAdd);
  }

  const participants = await competition.getParticipants();
  return participants.map(p => ({ ...p.toJSON(), participations: undefined }));
}

/**
 * Add all members of a group as participants of a competition.
 */
async function addAllGroupMembers(competition, groupId) {
  if (!competition) {
    throw new BadRequestError('Invalid competition.');
  }

  if (!groupId) {
    throw new BadRequestError('Invalid group id.');
  }

  // Find all the group's members
  const members = await groupService.getMembers(groupId);

  // Manually create participations for all these players
  await Participation.bulkCreate(members.map(p => ({ competitionId: competition.id, playerId: p.id })));

  // Update the "updatedAt" timestamp on the competition model
  await competition.changed('updatedAt', true);
  await competition.save();

  return members;
}

/**
 * Adds all the usernames as competition participants.
 */
async function addParticipants(id, verificationCode, usernames) {
  if (!id) {
    throw new BadRequestError('Invalid competition id.');
  }

  if (!verificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  if (!usernames || usernames.length === 0) {
    throw new BadRequestError('Invalid participants list.');
  }

  const competition = await Competition.findOne({ where: { id } });

  if (!competition) {
    throw new BadRequestError(`Competition of id ${id} was not found.`);
  }

  const verified = await verifyCode(competition.verificationHash, verificationCode);

  if (!verified) {
    throw new BadRequestError('Incorrect verification code.');
  }

  // Find all existing participants
  const existingIds = (await competition.getParticipants()).map(p => p.id);

  // Find or create all players with the given usernames
  const players = await playerService.findAllOrCreate(usernames);

  const newPlayers = players.filter(p => existingIds && !existingIds.includes(p.id));

  if (!newPlayers || !newPlayers.length) {
    throw new BadRequestError('All players given are already competing.');
  }

  await competition.addParticipants(newPlayers);

  // Update the "updatedAt" timestamp on the competition model
  await competition.changed('updatedAt', true);
  await competition.save();

  return newPlayers;
}

/**
 * Removes all the usernames (participants) from a competition.
 */
async function removeParticipants(id, verificationCode, usernames) {
  if (!id) {
    throw new BadRequestError('Invalid competition id.');
  }

  if (!verificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  if (!usernames || usernames.length === 0) {
    throw new BadRequestError('Invalid participants list.');
  }

  const competition = await Competition.findOne({ where: { id } });

  if (!competition) {
    throw new BadRequestError(`Competition of id ${id} was not found.`);
  }

  const verified = await verifyCode(competition.verificationHash, verificationCode);

  if (!verified) {
    throw new BadRequestError('Incorrect verification code.');
  }

  const playersToRemove = await playerService.findAll(usernames);

  if (!playersToRemove || !playersToRemove.length) {
    throw new BadRequestError('No valid untracked players were given.');
  }

  // Remove all specific players, and return the removed count
  const removedPlayersCount = await competition.removeParticipants(playersToRemove);

  if (!removedPlayersCount) {
    throw new BadRequestError('None of the players given were competing.');
  }

  // Update the "updatedAt" timestamp on the competition model
  await competition.changed('updatedAt', true);
  await competition.save();

  return removedPlayersCount;
}

/**
 * Sync all participations for a given player id.
 *
 * When a player is updated, this should be executed by a job.
 * This should update all the "endSnapshotId" field in the player's participations.
 */
async function syncParticipations(playerId) {
  const currentDate = new Date();

  const participations = await Participation.findAll({
    attributes: ['competitionId', 'playerId'],
    where: { playerId },
    include: [
      {
        model: Competition,
        attributes: ['startsAt', 'endsAt'],
        where: {
          startsAt: { [Op.lt]: currentDate },
          endsAt: { [Op.gte]: currentDate }
        }
      }
    ]
  });

  if (!participations || participations.length === 0) {
    return;
  }

  // Get most recent snapshot
  const latestSnapshot = await snapshotService.findLatest(playerId);

  await Promise.all(
    participations.map(async participation => {
      const { startsAt } = participation.competition;
      const startSnapshot = await snapshotService.findFirstSince(playerId, startsAt);

      await participation.update({
        startSnapshotId: startSnapshot.id,
        endSnapshotId: latestSnapshot.id
      });

      return participation;
    })
  );
}

/**
 * Get all participants for a specific competition id.
 */
async function getParticipants(id) {
  if (!id) {
    throw new BadRequestError('Invalid competition id.');
  }

  const competition = await Competition.findOne({ where: { id } });

  if (!competition) {
    throw new BadRequestError(`Competition of id ${id} was not found.`);
  }

  const participants = await competition.getParticipants();

  return participants;
}

/**
 * Adds all the playerIds to all ongoing/upcoming competitions of a specific group.
 *
 * This should be executed when players are added to a group, so that they can
 * participate in future or current group competitions.
 */
async function addToGroupCompetitions(groupId, playerIds) {
  // Find all upcoming/ongoing competitions for the group
  const competitions = await Competition.findAll({
    attributes: ['id'],
    where: {
      groupId,
      endsAt: { [Op.gt]: new Date() }
    }
  });

  const participations = [];

  // Build an array of all (supposed) participations
  competitions.forEach(c => {
    playerIds.forEach(playerId => {
      participations.push({ playerId, competitionId: c.id });
    });
  });

  // Bulk create all the participations, ignoring any duplicates
  await Participation.bulkCreate(participations, { ignoreDuplicates: true });
}

/**
 * Removes all the playerIds from all ongoing/upcoming competitions of a specific group.
 *
 * This should be executed when players are removed from a group, so that they are
 * no longer participating in future or current group competitions.
 */
async function removeFromGroupCompetitions(groupId, playerIds) {
  // Find all upcoming/ongoing competitions for the group
  const competitionIds = (
    await Competition.findAll({
      attributes: ['id'],
      where: {
        groupId,
        endsAt: { [Op.gt]: new Date() }
      }
    })
  ).map(c => c.id);

  await Participation.destroy({ where: { competitionId: competitionIds, playerId: playerIds } });
}

/**
 * Update all participants of a competition.
 *
 * An update action must be supplied, to be executed for
 * every participant. This is to prevent calling jobs from
 * within the service. I'd rather call them from the controller.
 *
 * Note: this is a soft update, meaning it will only create a new
 * snapshot. It won't import from CML or determine player type.
 */
async function updateAllParticipants(id, updateAction) {
  if (!id) {
    throw new BadRequestError('Invalid competition id.');
  }

  const competition = await Competition.findOne({ where: { id } });

  if (!competition) {
    throw new BadRequestError(`Competition of id ${id} was not found.`);
  }

  const [should, seconds] = await shouldUpdateAll(competition.updatedAllAt);

  // If the competition has had a global participant update
  // recently (in the past 10 mins), don't allow the api to
  // update all participants
  if (!should) {
    const secsLeft = Math.floor(600 - seconds);
    const timeLeft = secsLeft <= 60 ? `${secsLeft} seconds` : `${Math.floor(secsLeft / 60)} minutes`;
    const msg = `Failed to update: Please wait another ${timeLeft} before updating all participants.`;

    throw new BadRequestError(msg);
  }

  const participants = await competition.getParticipants();

  if (!participants || participants.length === 0) {
    throw new BadRequestError('This competition has no participants.');
  }

  // Execute the update action for every participant
  participants.forEach(player => updateAction(player));

  // Update the "updatedAllAt" field in the competition instance
  await competition.update({ updatedAllAt: new Date() });

  return participants;
}

exports.list = list;
exports.findForGroup = findForGroup;
exports.findForPlayer = findForPlayer;
exports.view = view;
exports.create = create;
exports.edit = edit;
exports.destroy = destroy;
exports.addParticipants = addParticipants;
exports.removeParticipants = removeParticipants;
exports.syncParticipations = syncParticipations;
exports.getParticipants = getParticipants;
exports.addToGroupCompetitions = addToGroupCompetitions;
exports.removeFromGroupCompetitions = removeFromGroupCompetitions;
exports.updateAllParticipants = updateAllParticipants;
