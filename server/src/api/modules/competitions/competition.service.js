const _ = require('lodash');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment');
const { ALL_METRICS, getValueKey, isSkill, isBoss, isActivity } = require('../../constants/metrics');
const STATUSES = require('../../constants/statuses.json');
const { Competition, Participation, Player, Group } = require('../../../database');
const { durationBetween, isValidDate, isPast } = require('../../util/dates');
const { generateVerification, verifyCode } = require('../../util/verification');
const { BadRequestError, NotFoundError } = require('../../errors');
const playerService = require('../players/player.service');
const snapshotService = require('../snapshots/snapshot.service');
const groupService = require('../groups/group.service');
const deltaService = require('../deltas/delta.service');

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

/**
 * Returns a list of all competitions that
 * match the query parameters (title, status, metric).
 */
async function getList(title, status, metric, pagination) {
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

  const competitions = await Competition.findAll({
    where: query,
    order: [
      ['score', 'DESC'],
      ['createdAt', 'DESC']
    ],
    limit: pagination.limit,
    offset: pagination.offset
  });

  const formattedCompetitions = competitions.map(c => {
    return { ...format(c), duration: durationBetween(c.startsAt, c.endsAt) };
  });

  const completeCompetitions = await attachParticipantCount(formattedCompetitions);
  return completeCompetitions;
}

/**
 * Returns a list of all competitions for a specific group.
 */
async function getGroupCompetitions(groupId, pagination = { limit: 10000, offset: 0 }) {
  const competitions = await Competition.findAll({
    where: { groupId },
    order: [['score', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset
  });

  const formattedCompetitions = competitions.map(c => {
    return { ...format(c), duration: durationBetween(c.startsAt, c.endsAt) };
  });

  const completeCompetitions = await attachParticipantCount(formattedCompetitions);
  return completeCompetitions;
}

/**
 * Find all competitions that a given player is participating in. (Or has participated)
 */
async function getPlayerCompetitions(playerId, pagination = { limit: 10000, offset: 0 }) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player id.`);
  }

  const participations = await Participation.findAll({
    where: { playerId },
    attributes: [],
    include: [{ model: Competition }]
  });

  const formattedCompetitions = participations
    .slice(pagination.offset, pagination.offset + pagination.limit)
    .map(({ competition }) => ({
      ...format(competition),
      duration: durationBetween(competition.startsAt, competition.endsAt)
    }))
    .sort((a, b) => b.score - a.score);

  const completeCompetitions = await attachParticipantCount(formattedCompetitions);
  return completeCompetitions;
}

/**
 * Given a list of competitions, it will fetch the participant count of each,
 * and inserts a "participantCount" field in every competition object.
 */
async function attachParticipantCount(competitions) {
  /**
   * Will return a participant count for every competition, with the format:
   * [ {competitionId: 35, count: "4"}, {competitionId: 41, count: "31"} ]
   */
  const participantCount = await Participation.findAll({
    where: { competitionId: competitions.map(countMap => countMap.id) },
    attributes: ['competitionId', [Sequelize.fn('COUNT', Sequelize.col('competitionId')), 'count']],
    group: ['competitionId']
  });

  /**
   * Convert the counts fetched above, into a key:value format:
   * { 35: 4, 41: 31 }
   */
  const countMap = _.mapValues(
    _.keyBy(
      participantCount.map(c => ({
        competitionId: c.competitionId,
        count: parseInt(c.toJSON().count, 10)
      })),
      c => c.competitionId
    ),
    c => c.count
  );

  return competitions.map(g => ({ ...g, participantCount: countMap[g.id] || 0 }));
}

/**
 * Get all the data on a given competition.
 */
async function getDetails(id) {
  if (!id) {
    throw new BadRequestError('Invalid competition id.');
  }

  const competition = await Competition.findOne({
    where: { id },
    include: [{ model: Group }]
  });

  if (!competition) {
    throw new NotFoundError(`Competition of id ${id} was not found.`);
  }

  const metricKey = getValueKey(competition.metric);
  const duration = durationBetween(competition.startsAt, competition.endsAt);
  const group = competition.group ? groupService.format(competition.group) : null;

  // Fetch all participations, including their players and snapshots
  const participations = await Participation.findAll({
    attributes: ['playerId'],
    where: { competitionId: id },
    include: [{ model: Player }]
  });

  const playerIds = participations.map(p => p.playerId);

  const leaderboard = await deltaService.getCompetitionLeaderboard(competition, playerIds);
  const leaderboardMap = _.keyBy(leaderboard, 'playerId');

  const participants = participations
    .map(({ player }) => ({
      id: player.id,
      username: player.username,
      displayName: player.displayName,
      type: player.type,
      updatedAt: player.updatedAt,
      history: [],
      progress: {
        start: leaderboardMap[player.id] ? leaderboardMap[player.id].startValue : 0,
        end: leaderboardMap[player.id] ? leaderboardMap[player.id].endValue : 0,
        gained: leaderboardMap[player.id] ? leaderboardMap[player.id].gained : 0
      }
    }))
    .sort((a, b) => b.progress.gained - a.progress.gained);

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
    participants.map(p => p.progress.gained).reduce((a, c) => a + Math.max(0, c));

  return { ...format(competition), duration, totalGained, participants, group };
}

/**
 * Create a new competition.
 *
 * Note: if a groupId is given, the participants will be
 * the group's members, and the "participants" argument will be ignored.
 */
async function create(title, metric, startsAt, endsAt, groupId, groupVerificationCode, participants) {
  if (!title) {
    throw new BadRequestError('Invalid competition title.');
  }

  if (!metric || !ALL_METRICS.includes(metric)) {
    throw new BadRequestError('Invalid competition metric.');
  }

  if (!startsAt || !isValidDate(startsAt)) {
    throw new BadRequestError('Invalid start date.');
  }

  if (!endsAt || !isValidDate(endsAt)) {
    throw new BadRequestError('Invalid end date.');
  }

  if (new Date(startsAt) - new Date(endsAt) > 0) {
    throw new BadRequestError('Start date must be before the end date.');
  }

  if (isPast(startsAt) || isPast(endsAt)) {
    throw new BadRequestError('Invalid dates: All start and end dates must be in the future.');
  }

  if (groupId) {
    if (!groupVerificationCode) {
      throw new BadRequestError('Invalid verification code.');
    }

    const group = await groupService.findOne(groupId);

    if (!group) {
      throw new BadRequestError('Invalid group id.');
    }

    const verified = await verifyCode(group.verificationHash, groupVerificationCode);

    if (!verified) {
      throw new BadRequestError('Incorrect group verification code.');
    }
  }

  // Check if every username in the list is valid
  if (participants && participants.length > 0) {
    const invalidUsernames = participants.filter(username => !playerService.isValidUsername(username));

    if (invalidUsernames.length > 0) {
      throw new BadRequestError(
        `${invalidUsernames.length} Invalid usernames: Names must be 1-12 characters long, 
         contain no special characters, and/or contain no space at the beginning or end of the name.`,
        invalidUsernames
      );
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

  if (new Date(startsAt) - new Date(endsAt) > 0) {
    throw new BadRequestError('Start date must be before the end date.');
  }

  const competition = await Competition.findOne({ where: { id } });

  if (!competition) {
    throw new BadRequestError(`Competition of id ${id} was not found.`);
  }

  if (metric && !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid competition metric.`);
  }

  if (metric && metric !== competition.metric && isPast(competition.startsAt)) {
    throw new BadRequestError(`The competition has started, the metric cannot be changed.`);
  }

  if (
    startsAt &&
    new Date(startsAt).getTime() !== competition.startsAt.getTime() &&
    isPast(competition.startsAt)
  ) {
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

  let competitionParticipants;

  // Check if every username in the list is valid
  if (participants) {
    const invalidUsernames = participants.filter(username => !playerService.isValidUsername(username));

    if (invalidUsernames.length > 0) {
      throw new BadRequestError(
        `${invalidUsernames.length} Invalid usernames: Names must be 1-12 characters long, 
         contain no special characters, and/or contain no space at the beginning or end of the name.`,
        invalidUsernames
      );
    }

    competitionParticipants = await setParticipants(competition, participants);
  } else {
    const participations = await competition.getParticipants();
    competitionParticipants = participations.map(p => ({ ...p.toJSON(), participations: undefined }));
  }

  await competition.update(newValues);

  return { ...format(competition), participants: competitionParticipants };
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

  const uniqueUsernames = _.uniqBy(usernames, p => p.toLowerCase());

  const existingParticipants = await competition.getParticipants();
  const existingUsernames = existingParticipants.map(e => e.username);

  const usernamesToAdd = uniqueUsernames.filter(u => !existingUsernames.includes(u));

  const playersToRemove = existingParticipants.filter(p => !uniqueUsernames.includes(p.username));
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
  const competition = await getCompetitionForParticipantOperation(id, verificationCode, usernames);

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
  const competition = await getCompetitionForParticipantOperation(id, verificationCode, usernames);

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

async function getCompetitionForParticipantOperation(id, verificationCode, usernames) {
  if (!id) {
    throw new NotFoundError('Invalid competition id.');
  }

  if (!verificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  if (!usernames || usernames.length === 0) {
    throw new BadRequestError('Invalid participants list.');
  }

  const competition = await Competition.findOne({ where: { id } });

  if (!competition) {
    throw new NotFoundError(`Competition of id ${id} was not found.`);
  }

  const verified = await verifyCode(competition.verificationHash, verificationCode);

  if (!verified) {
    throw new BadRequestError('Incorrect verification code.');
  }

  return competition;
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
 * Get outdated participants for a specific competition id.
 * A participant is considered outdated 10 minutes after their last update
 */
async function getOutdatedParticipants(competitionId) {
  if (!competitionId) {
    throw new BadRequestError('Invalid competition id.');
  }

  const tenMinsAgo = moment().subtract(10, 'minute');

  const participantsToUpdate = await Participation.findAll({
    attributes: ['competitionId', 'playerId'],
    where: { competitionId },
    include: [
      {
        model: Player,
        where: {
          updatedAt: { [Op.lt]: tenMinsAgo.toDate() }
        }
      }
    ]
  });

  return participantsToUpdate.map(({ player }) => player);
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

  const participants = await getOutdatedParticipants(id);

  if (!participants || participants.length === 0) {
    throw new BadRequestError('This competition has no participants that should be updated');
  }

  // Execute the update action for every participant
  participants.forEach(player => updateAction(player));

  return participants;
}

async function refreshScores() {
  const allCompetitions = await Competition.findAll();

  await Promise.all(
    allCompetitions.map(async competition => {
      const currentScore = competition.score;
      const newScore = await calculateScore(competition);

      console.log(competition.title, newScore);

      if (newScore !== currentScore) {
        await competition.update({ score: newScore });
      }
    })
  );
}

async function calculateScore(competition) {
  const now = new Date();
  let score = 0;

  // If has ended
  if (competition.endsAt < now) {
    return score;
  }

  const data = await getDetails(competition.id);
  const activeParticipants = data.participants.filter(p => p.progress.gained > 0);
  const averageGained = data.totalGained / activeParticipants.length;

  // If is ongoing
  if (competition.startsAt <= now && competition.endsAt >= now) {
    score += 100;
  }

  // If is upcoming
  if (competition.startsAt > now) {
    const daysLeft = (competition.startsAt - now) / 1000 / 3600 / 24;

    if (daysLeft > 7) {
      score += 60;
    } else {
      score += 80;
    }
  }

  // If is group competition
  if (data.group) {
    // The highest of 30, or 30% of the group's score
    score += Math.max(40, data.group.score * 0.4);

    if (data.group.verified) {
      score += 50;
    }
  }

  // If has atleast 10 active participants
  if (activeParticipants.length >= 10) {
    score += 60;
  }

  // If has atleast 50 active participants
  if (activeParticipants.length >= 50) {
    score += 80;
  }

  if (isSkill(competition.metric)) {
    // If the average active participant has gained > 10k exp
    if (averageGained > 10000) {
      score += 30;
    }

    // If the average active participant has gained > 100k exp
    if (averageGained > 100000) {
      score += 50;
    }
  }

  if (isBoss(competition.metric)) {
    // If the average active participant has gained > 5 kc
    if (averageGained > 5) {
      score += 30;
    }

    // If the average active participant has gained > 30 kc
    if (averageGained > 20) {
      score += 50;
    }
  }

  if (isActivity(competition.metric)) {
    // If the average active participant has gained > 5 score
    if (averageGained > 5) {
      score += 30;
    }

    // If the average active participant has gained > 50 score
    if (averageGained > 20) {
      score += 50;
    }
  }

  // Discourage "overall" competitions, they are often tests
  if (competition.metric !== 'overall') {
    score += 30;
  }

  // Discourage "over 2 weeks long" competitions
  if (competition.endsAt - competition.startsAt < 1209600000) {
    score += 50;
  }

  return score;
}

exports.getList = getList;
exports.getGroupCompetitions = getGroupCompetitions;
exports.getPlayerCompetitions = getPlayerCompetitions;
exports.getDetails = getDetails;
exports.getParticipants = getParticipants;
exports.create = create;
exports.edit = edit;
exports.destroy = destroy;
exports.addParticipants = addParticipants;
exports.removeParticipants = removeParticipants;
exports.addToGroupCompetitions = addToGroupCompetitions;
exports.removeFromGroupCompetitions = removeFromGroupCompetitions;
exports.updateAllParticipants = updateAllParticipants;
exports.refreshScores = refreshScores;
