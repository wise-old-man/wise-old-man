import { keyBy, mapValues, omit, uniqBy } from 'lodash';
import moment from 'moment';
import { Op, Sequelize } from 'sequelize';
import { Competition, Group, Participation, Player, Snapshot } from '../../../database/models';
import { CompetitionDetails } from '../../../types';
import { ALL_METRICS, COMPETITION_STATUSES } from '../../constants';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../errors';
import { durationBetween, isPast, isValidDate } from '../../util/dates';
import { getMinimumBossKc, getValueKey, isActivity, isBoss, isSkill } from '../../util/metrics';
import * as cryptService from '../external/crypt.service';
import * as groupService from './group.service';
import * as playerService from './player.service';
import * as snapshotService from './snapshot.service';

function sanitizeTitle(title) {
  return title
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/ +(?= )/g, '')
    .trim();
}

function format(competition: Competition) {
  const obj = { ...competition.toJSON() };

  // Hide the verification hash
  // @ts-ignore
  delete obj.verificationHash;

  return obj;
}

async function resolve(competitionId: number, includeGroup = false): Promise<Competition> {
  if (!competitionId || isNaN(competitionId)) {
    throw new BadRequestError('Invalid competition id.');
  }

  const competition = await Competition.findOne({
    where: { id: competitionId },
    include: includeGroup ? [{ model: Group }] : []
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  return competition;
}

/**
 * Returns a list of all competitions that
 * match the query parameters (title, status, metric).
 */
async function getList(title, status, metric, pagination) {
  // The status is optional, however if present, should be valid
  if (status && !COMPETITION_STATUSES.includes(status.toLowerCase())) {
    throw new BadRequestError(`Invalid status.`);
  }

  // The metric is optional, however if present, should be valid
  if (metric && !ALL_METRICS.includes(metric.toLowerCase())) {
    throw new BadRequestError(`Invalid metric.`);
  }

  const query: any = {};

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
async function getPlayerCompetitions(playerId: number, pagination = { limit: 10000, offset: 0 }) {
  const participations = await Participation.findAll({
    where: { playerId },
    attributes: [],
    include: [{ model: Competition }]
  });

  const formattedCompetitions = participations
    .slice(pagination.offset, pagination.offset + pagination.limit)
    .map(
      ({ competition }) =>
        ({
          ...format(competition),
          duration: durationBetween(competition.startsAt, competition.endsAt)
        } as any)
    )
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
  const countMap = mapValues(
    keyBy(
      participantCount.map((c: any) => ({
        competitionId: c.competitionId,
        count: parseInt(c.toJSON().count, 10)
      })),
      c => c.competitionId
    ),
    (c: any) => c.count
  );

  return competitions.map(g => ({ ...g, participantCount: countMap[g.id] || 0 }));
}

/**
 * Get all the data on a given competition.
 */
async function getDetails(competition: Competition): Promise<CompetitionDetails> {
  const metricKey = getValueKey(competition.metric);
  const duration = durationBetween(competition.startsAt, competition.endsAt);
  const group = competition.group ? groupService.format(competition.group) : null;

  const participations = await Participation.findAll({
    attributes: ['playerId'],
    where: { competitionId: competition.id },
    include: [
      { model: Player },
      { model: Snapshot, as: 'startSnapshot', attributes: [metricKey] },
      { model: Snapshot, as: 'endSnapshot', attributes: [metricKey] }
    ]
  });

  const minimumValue = getMinimumBossKc(competition.metric);

  const participants = participations
    .map(({ player, startSnapshot, endSnapshot }) => {
      const start = startSnapshot ? startSnapshot[metricKey] : -1;
      const end = endSnapshot ? endSnapshot[metricKey] : -1;
      const gained = Math.max(0, end - Math.max(minimumValue - 1, start));

      return {
        ...player.toJSON(),
        progress: { start, end, gained },
        history: []
      };
    })
    .sort((a, b) => b.progress.gained - a.progress.gained);

  // Select the top 5 players
  const top5Ids = participants.slice(0, 5).map((p: any) => p.id);

  // Select all snapshots for the top 5 players, created during the competition
  const raceSnapshots = await snapshotService.findAllBetween(
    top5Ids,
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
    const player = participants.find((p: any) => p.id === d.playerId);

    if (player) {
      player.history.push({
        date: d.createdAt,
        value: d.value
      });
    }
  });

  // Sum all gained values
  const totalGained = participants.map(p => p.progress.gained).reduce((a, c) => a + Math.max(0, c), 0);

  // @ts-ignore
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

  if ((new Date(startsAt) as any) - (new Date(endsAt) as any) > 0) {
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
      throw new NotFoundError('Error: Group could not be found.');
    }

    const verified = await cryptService.verifyCode(group.verificationHash, groupVerificationCode);

    if (!verified) {
      throw new ForbiddenError('Incorrect group verification code.');
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

  const [code, hash] = await cryptService.generateVerification();
  const sanitizedTitle = sanitizeTitle(title);

  const competition = await Competition.create({
    title: sanitizedTitle,
    metric: metric.toLowerCase(),
    verificationCode: code,
    verificationHash: hash,
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

  // If it's a group competition, don't return a verification code
  const formatted = competition.groupId
    ? omit(format(competition), ['verificationCode'])
    : format(competition);

  return { ...formatted, participants: newParticipants };
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

  if ((new Date(startsAt) as any) - (new Date(endsAt) as any) > 0) {
    throw new BadRequestError('Start date must be before the end date.');
  }

  const competition = await Competition.findOne({ where: { id } });

  if (!competition) {
    throw new NotFoundError(`Competition of id ${id} was not found.`);
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

  const verified = await isVerified(competition, verificationCode);

  if (!verified) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  const newValues: any = {};

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
    const participations = await competition.$get('participants');
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
    throw new NotFoundError(`Competition of id ${id} was not found.`);
  }

  const verified = await isVerified(competition, verificationCode);

  if (!verified) {
    throw new ForbiddenError('Incorrect verification code.');
  }

  await competition.destroy();
  return title;
}

/**
 * Set the participants of a competition.
 *
 * This will replace any existing participants.
 */
async function setParticipants(competition: Competition, usernames: string[]) {
  if (!competition) {
    throw new BadRequestError(`Invalid competition.`);
  }

  const uniqueUsernames = uniqBy(usernames, u => playerService.standardize(u));

  const existingParticipants = await competition.$get('participants');
  const existingUsernames = existingParticipants.map(e => e.username);

  const usernamesToAdd = uniqueUsernames.filter(
    u => !existingUsernames.includes(playerService.standardize(u))
  );

  const playersToRemove = existingParticipants.filter(
    p => !uniqueUsernames.map(playerService.standardize).includes(p.username)
  );

  const playersToAdd = await playerService.findAllOrCreate(usernamesToAdd);

  if (playersToRemove && playersToRemove.length > 0) {
    await competition.$remove('participants', playersToRemove);
  }

  if (playersToAdd && playersToAdd.length > 0) {
    await competition.$add('participants', playersToAdd);
  }

  const participants = await competition.$get('participants');
  return participants.map(p => ({ ...p.toJSON(), participations: undefined }));
}

/**
 * Add all members of a group as participants of a competition.
 */
async function addAllGroupMembers(competition, groupId) {
  // Find all the group's members
  const members = await groupService.getMembers(groupId);

  // Manually create participations for all these players
  await Participation.bulkCreate(
    members.map((p: any) => ({ competitionId: competition.id, playerId: p.id }))
  );

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
  const existingIds = (await competition.$get('participants')).map(p => p.id);

  // Find or create all players with the given usernames
  const players = await playerService.findAllOrCreate(usernames);

  const newPlayers = players.filter(p => existingIds && !existingIds.includes(p.id));

  if (!newPlayers || !newPlayers.length) {
    throw new BadRequestError('All players given are already competing.');
  }

  await competition.$add('participants', newPlayers);

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
  const removedPlayersCount = await competition.$remove('participants', playersToRemove);

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

  const verified = await isVerified(competition, verificationCode);

  if (!verified) {
    throw new ForbiddenError('Incorrect verification code.');
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
    throw new NotFoundError(`Competition of id ${id} was not found.`);
  }

  const participants = await competition.$get('participants');

  return participants;
}

/**
 * Get outdated participants for a specific competition id.
 * A participant is considered outdated 60 minutes after their last update
 */
async function getOutdatedParticipants(competitionId) {
  if (!competitionId) {
    throw new BadRequestError('Invalid competition id.');
  }

  const hourAgo = moment().subtract(60, 'minute');

  const participantsToUpdate = await Participation.findAll({
    attributes: ['competitionId', 'playerId'],
    where: { competitionId },
    include: [
      {
        model: Player,
        where: { updatedAt: { [Op.lt]: hourAgo.toDate() } }
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
    throw new NotFoundError(`Competition of id ${id} was not found.`);
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

      if (newScore !== currentScore) {
        await competition.update({ score: newScore });
      }
    })
  );
}

async function calculateScore(competition: Competition): Promise<number> {
  const now = new Date();
  let score = 0;

  // If has ended
  if (competition.endsAt < now) {
    return score;
  }

  const details = await getDetails(competition);
  const activeParticipants = details.participants.filter(p => p.progress.gained > 0);
  const averageGained = details.totalGained / activeParticipants.length;

  // If is ongoing
  if (competition.startsAt <= now && competition.endsAt >= now) {
    score += 100;
  }

  // If is upcoming
  if (competition.startsAt > now) {
    const daysLeft = (competition.startsAt.getTime() - now.getTime()) / 1000 / 3600 / 24;

    if (daysLeft > 7) {
      score += 60;
    } else {
      score += 80;
    }
  }

  // If is group competition
  if (details.group) {
    // The highest of 30, or 30% of the group's score
    score += Math.max(40, details.group.score * 0.4);

    if (details.group.verified) {
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
  if (competition.endsAt.getTime() - competition.startsAt.getTime() < 1209600000) {
    score += 50;
  }

  return score;
}

async function isVerified(competition, verificationCode) {
  const { groupId, verificationHash } = competition;

  let hash = verificationHash;

  // If it is a group competition, compare the code
  // to the group's verification hash instead
  if (groupId) {
    const group = await Group.findOne({ where: { id: groupId } });

    if (!group) {
      throw new NotFoundError(`Group of id ${groupId} was not found.`);
    }

    hash = group.verificationHash;
  }

  const verified = await cryptService.verifyCode(hash, verificationCode);
  return verified;
}

/**
 * Sync all participations for a given player id.
 *
 * When a player is updated, this should be executed by a job.
 * This should update all the "endSnapshotId" field in the player's participations.
 */
async function syncParticipations(playerId: number, latestSnapshot: Snapshot) {
  // Get all on-going participations
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

  await Promise.all(
    participations.map(async participation => {
      // Update this participation's latest (end) snapshot
      participation.endSnapshotId = latestSnapshot.id;

      // If this participation's starting snapshot has not been set,
      // find the first snapshot created since the start date and set it
      if (!participation.startSnapshot) {
        const startDate = participation.competition.startsAt;
        const start = await snapshotService.findFirstSince(playerId, startDate);

        participation.startSnapshotId = start.id;
      }

      await participation.save();

      return participation;
    })
  );
}

export {
  resolve,
  getList,
  getGroupCompetitions,
  getPlayerCompetitions,
  getDetails,
  getParticipants,
  create,
  edit,
  destroy,
  addParticipants,
  removeParticipants,
  addToGroupCompetitions,
  removeFromGroupCompetitions,
  updateAllParticipants,
  refreshScores,
  syncParticipations
};
