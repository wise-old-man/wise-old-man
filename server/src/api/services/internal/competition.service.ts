import { filter, includes, omit, uniqBy } from 'lodash';
import moment from 'moment';
import { Op, Sequelize } from 'sequelize';
import { Competition, Group, Participation, Player, Snapshot } from '../../../database/models';
import { Pagination } from '../../../types';
import { ALL_METRICS, COMPETITION_STATUSES, COMPETITION_TYPES } from '../../constants';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../errors';
import { durationBetween, isPast } from '../../util/dates';
import { getMinimumBossKc, getValueKey } from '../../util/metrics';
import { round } from '../../util/numbers';
import { buildQuery } from '../../util/query';
import * as cryptService from '../external/crypt.service';
import * as groupService from './group.service';
import * as playerService from './player.service';
import * as snapshotService from './snapshot.service';

interface Team {
  name: string;
  participants: string[];
}

interface CompetitionParticipant extends Player {
  progress: {
    start: number;
    end: number;
    gained: number;
  };
  history?: {
    date: Date;
    value: number;
  }[];
}

interface CompetitionDetails extends Competition {
  duration: string;
  totalGained: number;
  participants: CompetitionParticipant[];
}

interface ExtendedCompetition extends Competition {
  participantCount: number;
  duration: string;
}

interface ResolveOptions {
  includeGroup?: boolean;
  includeHash?: boolean;
}

interface CompetitionListFilter {
  title?: string;
  metric?: string;
  status?: string;
  type?: string;
}

interface CreateCompetitionDTO {
  title: string;
  metric: string;
  startsAt: Date;
  endsAt: Date;
  groupId?: number;
  groupVerificationCode?: string;
  participants?: string[];
  teams?: Team[];
}

interface EditCompetitionDTO {
  title?: string;
  metric?: string;
  startsAt?: Date;
  endsAt?: Date;
  participants?: string[];
  teams?: Team[];
}

function sanitizeTitle(title: string): string {
  return title
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/ +(?= )/g, '')
    .trim();
}

async function resolve(competitionId: number, options?: ResolveOptions): Promise<Competition> {
  if (!competitionId || isNaN(competitionId)) {
    throw new BadRequestError('Invalid competition id.');
  }

  const scope = options && options.includeHash ? 'withHash' : 'defaultScope';

  const competition = await Competition.scope(scope).findOne({
    where: { id: competitionId },
    include: options && options.includeGroup ? [{ model: Group }] : []
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
async function getList(filter: CompetitionListFilter, pagination: Pagination) {
  const { title, status, metric, type } = filter;

  // The status is optional, however if present, should be valid
  if (status && !COMPETITION_STATUSES.includes(status.toLowerCase())) {
    throw new BadRequestError(`Invalid status.`);
  }

  // The metric is optional, however if present, should be valid
  if (metric && !ALL_METRICS.includes(metric.toLowerCase())) {
    throw new BadRequestError(`Invalid metric.`);
  }

  // The type is optional, however if present, should be valid
  if (type && !COMPETITION_TYPES.includes(type.toLowerCase())) {
    throw new BadRequestError(`Invalid type.`);
  }

  const query = buildQuery({
    title: title && { [Op.iLike]: `%${sanitizeTitle(title)}%` },
    metric: metric?.toLowerCase(),
    type: type?.toLowerCase()
  });

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

  const extendedCompetitions = await extendCompetitions(competitions);

  return extendedCompetitions;
}

/**
 * Returns a list of all competitions for a specific group.
 */
async function getGroupCompetitions(groupId: number, pagination: Pagination): Promise<Competition[]> {
  const competitions = await Competition.findAll({
    where: { groupId },
    order: [['id', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset
  });

  const extendedCompetitions = await extendCompetitions(competitions);

  return extendedCompetitions;
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

  const preparedCompetitions = participations
    .slice(pagination.offset, pagination.offset + pagination.limit)
    .map(p => p.competition)
    .sort((a, b) => b.id - a.id);

  const extendedCompetitions = await extendCompetitions(preparedCompetitions);

  return extendedCompetitions;
}

/**
 * Given a list of competitions, it will fetch the participant count of each,
 * and inserts a "participantCount" field in every competition object.
 */
async function extendCompetitions(competitions: Competition[]): Promise<ExtendedCompetition[]> {
  /**
   * Will return a participant count for every competition, with the format:
   * [ {competitionId: 35, count: "4"}, {competitionId: 41, count: "31"} ]
   */
  const participantCount = await Participation.findAll({
    where: { competitionId: competitions.map(countMap => countMap.id) },
    attributes: ['competitionId', [Sequelize.fn('COUNT', Sequelize.col('competitionId')), 'count']],
    group: ['competitionId'],
    raw: true
  });

  return competitions.map(c => {
    const match: any = participantCount.find(m => m.competitionId === c.id);
    const duration = durationBetween(c.startsAt, c.endsAt);
    return { ...(c.toJSON() as any), duration, participantCount: parseInt(match ? match.count : 0) };
  });
}

/**
 * Get all the data on a given competition.
 */
async function getDetails(competition: Competition): Promise<CompetitionDetails | any> {
  const metricKey = getValueKey(competition.metric);
  const duration = durationBetween(competition.startsAt, competition.endsAt);

  const participations = await Participation.findAll({
    attributes: ['playerId', 'teamName'],
    where: { competitionId: competition.id },
    include: [
      { model: Player },
      { model: Snapshot, as: 'startSnapshot', attributes: [metricKey] },
      { model: Snapshot, as: 'endSnapshot', attributes: [metricKey] }
    ]
  });

  const minimumValue = getMinimumBossKc(competition.metric);

  const participants = participations
    .map(({ player, teamName, startSnapshot, endSnapshot }) => {
      const start = startSnapshot ? startSnapshot[metricKey] : -1;
      const end = endSnapshot ? endSnapshot[metricKey] : -1;
      const gained = Math.max(0, round(end - Math.max(minimumValue - 1, start), 5));

      return {
        ...player.toJSON(),
        teamName,
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

  return { ...competition.toJSON(), duration, totalGained, participants, group: competition.group };
}

async function validateGroupVerification(groupId: number, groupVerificationCode: string) {
  if (!groupVerificationCode) {
    throw new BadRequestError('Invalid verification code.');
  }

  const group = await groupService.resolve(groupId, true);
  const verified = await cryptService.verifyCode(group.verificationHash, groupVerificationCode);

  if (!verified) {
    throw new ForbiddenError('Incorrect group verification code.');
  }
}

function validateTeamsList(teams: Team[]) {
  if (!teams || teams.length === 0) {
    throw new BadRequestError('Invalid or empty teams list.');
  }

  if (teams.some(t => !t.name || typeof t.name !== 'string' || t.name.length === 0)) {
    throw new BadRequestError('All teams must have a name property.');
  }

  // Sanitize each team's name
  teams.forEach(t => {
    t.name = sanitizeTitle(t.name);
  });

  // Find duplicate team names
  const teamNames = teams.map(t => t.name.toLowerCase());
  const duplicateTeams = filter(teamNames, (val, i, it) => includes(it, val, i + 1));

  if (duplicateTeams && duplicateTeams.length > 0) {
    throw new BadRequestError(`Found repeated team names: [${duplicateTeams.join(', ')}]`);
  }

  if (teams.some(t => !t.participants || t.participants.length === 0)) {
    throw new BadRequestError('All teams must have a valid (non-empty) array of participants.');
  }

  // standardize each player's username
  teams.forEach(t => {
    t.participants = t.participants.map(playerService.standardize);
  });

  const allUsernames = teams.map(t => t.participants).flat();

  if (allUsernames.some(username => !username || typeof username !== 'string')) {
    throw new BadRequestError('All participant names must be valid strings.');
  }

  // Find duplicate usernames across all teams
  const duplicateUsernames = filter(allUsernames, (val, i, it) => includes(it, val, i + 1));

  if (duplicateUsernames && duplicateUsernames.length > 0) {
    throw new BadRequestError(`Found repeated usernames: [${duplicateUsernames.join(', ')}]`);
  }

  validateParticipantsList(allUsernames);
}

function validateParticipantsList(participants: string[]) {
  if (!participants || participants.length === 0) {
    throw new BadRequestError('Invalid or empty participants list.');
  }

  const invalidUsernames = participants.filter(username => !playerService.isValidUsername(username));

  if (invalidUsernames.length > 0) {
    throw new BadRequestError(
      `${invalidUsernames.length} Invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
  }

  const allUsernames = participants.map(playerService.standardize);
  const duplicateUsernames = filter(allUsernames, (val, i, it) => includes(it, val, i + 1));

  if (duplicateUsernames && duplicateUsernames.length > 0) {
    throw new BadRequestError(`Found repeated usernames: [${duplicateUsernames.join(', ')}]`);
  }
}

/**
 * Create a new competition.
 *
 * Note: if a groupId is given, the participants will be
 * the group's members, and the "participants" argument will be ignored.
 */
async function create(dto: CreateCompetitionDTO) {
  const { title, metric, startsAt, endsAt, groupId, groupVerificationCode, participants, teams } = dto;

  if (!metric || !ALL_METRICS.includes(metric)) {
    throw new BadRequestError('Invalid competition metric.');
  }

  if (startsAt.getTime() - endsAt.getTime() > 0) {
    throw new BadRequestError('Start date must be before the end date.');
  }

  if (isPast(startsAt) || isPast(endsAt)) {
    throw new BadRequestError('Invalid dates: All start and end dates must be in the future.');
  }

  const isGroupCompetition = !!groupId;
  const isTeamCompetition = teams && teams.length > 0;
  const hasParticipants = participants && participants.length > 0;

  if (hasParticipants && isGroupCompetition) {
    throw new BadRequestError(
      `Cannot include both "participants" and "groupId", they are mutually exclusive. 
      All group members will be registered as participants instead.`
    );
  }

  if (hasParticipants && isTeamCompetition) {
    throw new BadRequestError(
      'Cannot include both "participants" and "teams", they are mutually exclusive.'
    );
  }

  // Check if group verification code is valid
  if (isGroupCompetition) await validateGroupVerification(groupId, groupVerificationCode);
  // Check if every username in the list is valid
  if (hasParticipants) validateParticipantsList(participants);
  // Check if all teams are valid and correctly formatted
  if (isTeamCompetition) validateTeamsList(teams);

  const [code, hash] = await cryptService.generateVerification();

  const competition = await Competition.create({
    title: sanitizeTitle(title),
    metric,
    verificationCode: code,
    verificationHash: hash,
    type: COMPETITION_TYPES[isTeamCompetition ? 1 : 0],
    startsAt,
    endsAt,
    groupId
  });

  // If is empty competition
  if (!isGroupCompetition && !hasParticipants && !isTeamCompetition) {
    return { ...competition.toJSON(), participants: [] };
  }

  if (isTeamCompetition) {
    const newParticipants = await setTeams(competition, teams);
    return { ...competition.toJSON(), participants: newParticipants };
  }

  if (isGroupCompetition) {
    const newParticipants = await addAllGroupMembers(competition, groupId);
    return { ...competition.toJSON(), participants: newParticipants };
  }

  const newParticipants = await setParticipants(competition, participants);
  return { ...competition.toJSON(), participants: newParticipants };
}

/**
 * Edit a competition
 *
 * Note: If "participants" is defined, it will replace the existing participants.
 */
async function edit(competition: Competition, dto: EditCompetitionDTO) {
  const { title, metric, startsAt, endsAt, participants, teams } = dto;

  if (startsAt && endsAt && startsAt.getTime() - endsAt.getTime() > 0) {
    throw new BadRequestError('Start date must be before the end date.');
  }

  if (metric && !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid competition metric.`);
  }

  const hasNewTeams = teams && teams.length > 0;
  const hasNewParticipants = participants && participants.length > 0;

  if (competition.type === 'classic' && hasNewTeams) {
    throw new BadRequestError("The competition type cannot be changed to 'team'.");
  }

  if (competition.type === 'team' && hasNewParticipants) {
    throw new BadRequestError("The competition type cannot be changed to 'classic'.");
  }

  // If competition has started
  if (isPast(competition.startsAt)) {
    if (metric && metric !== competition.metric) {
      throw new BadRequestError('The competition has started, the metric cannot be changed.');
    }

    if (startsAt && startsAt.getTime() !== competition.startsAt.getTime()) {
      throw new BadRequestError('The competition has started, the start date cannot be changed.');
    }
  }

  const newValues = buildQuery({
    title: title && sanitizeTitle(title),
    metric,
    startsAt,
    endsAt
  });

  if (hasNewParticipants) {
    // Check if every username in the list is valid
    validateParticipantsList(participants);
    // Update the participant list
    const newParticipants = await setParticipants(competition, participants);
    // Update the competition
    await competition.update(newValues);

    return { ...competition.toJSON(), participants: newParticipants };
  }

  if (hasNewTeams) {
    // Check if all teams are valid and correctly formatted
    validateTeamsList(teams);
    // Add new participations, with associated teams
    const newParticipants = await setTeams(competition, teams);
    // Update the competition
    await competition.update(newValues);

    return { ...competition.toJSON(), participants: newParticipants };
  }

  // The participants haven't changed, only update
  // the competition details and return the existing participants
  await competition.update(newValues);

  const participations = await competition.$get('participants');
  const currentParticipants = participations.map(p => omit(p.toJSON(), ['participations']));

  return { ...competition.toJSON(), participants: currentParticipants };
}

/**
 * Permanently delete a competition and all associated participations.
 */
async function destroy(competition: Competition) {
  const competitionTitle = competition.title;

  await competition.destroy();
  return competitionTitle;
}

async function setTeams(competition: Competition, teams: Team[]) {
  if (!competition) throw new BadRequestError('Invalid competition.');

  const allUsernames = teams.map(t => t.participants.map(playerService.standardize)).flat();
  const allPlayers = await playerService.findAllOrCreate(allUsernames);

  const playersMap = Object.fromEntries(allPlayers.map(p => [p.username, p]));

  // Delete all existing participations (and teams)
  await Participation.destroy({ where: { competitionId: competition.id } });

  await Promise.all(
    teams.map(async team => {
      const teamName = team.name;
      const participants = team.participants.map(p => playersMap[playerService.standardize(p)]);

      await competition.$add('participants', participants, { through: { teamName } });

      return { teamName, participants };
    })
  );

  const participants = await competition.$get('participants');

  return participants.map((p: any) => ({
    ...omit(p.toJSON(), ['participations']),
    teamName: p.participations.teamName
  }));
}

/**
 * Set the participants of a competition.
 *
 * This will replace any existing participants.
 */
async function setParticipants(competition: Competition, usernames: string[]) {
  if (!competition) throw new BadRequestError(`Invalid competition.`);

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
  return participants.map(p => omit(p.toJSON(), ['participations']));
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
async function addParticipants(competition: Competition, usernames: string[]) {
  if (competition.type === 'team') {
    throw new BadRequestError('Cannot add participants to a team competition.');
  }

  if (usernames.length === 0) {
    throw new BadRequestError('Empty participants list.');
  }

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
async function removeParticipants(competition: Competition, usernames: string[]) {
  if (competition.type === 'team') {
    throw new BadRequestError('Cannot remove participants from a team competition.');
  }

  if (usernames.length === 0) {
    throw new BadRequestError('Empty participants list.');
  }

  const playersToRemove = await playerService.findAll(usernames);

  if (!playersToRemove || !playersToRemove.length) {
    throw new BadRequestError('No valid tracked players were given.');
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

async function addTeams(competition: Competition, teams: Team[]) {
  if (!teams || teams.length === 0) {
    throw new BadRequestError('Empty teams list.');
  }

  if (competition.type === 'classic') {
    throw new BadRequestError("Teams can't be added to a classic competition.");
  }

  // Check if all teams are valid and correctly formatted
  validateTeamsList(teams);

  // Fetch all current teams
  const currentTeams = await getTeams(competition);

  const currentTeamNames = currentTeams.map((t: any) => t.name);
  const currentUsernames = currentTeams.map((t: any) => t.participants.map(p => p.username)).flat();

  const newTeamNames = teams.map(t => t.name);
  const newUsernames = teams.map(t => t.participants).flat();

  const duplicateTeamNames = newTeamNames.filter(t =>
    currentTeamNames.map((c: string) => c.toLowerCase()).includes(t.toLowerCase())
  );

  const duplicateUsernames = newUsernames.filter(t =>
    currentUsernames.map((c: string) => c).includes(t)
  );

  if (duplicateTeamNames && duplicateTeamNames.length > 0) {
    throw new BadRequestError(`Found repeated team names: [${duplicateTeamNames.join(', ')}]`);
  }

  if (duplicateUsernames && duplicateUsernames.length > 0) {
    throw new BadRequestError(`Found repeated usernames: [${duplicateUsernames.join(', ')}]`);
  }

  const newPlayers = await playerService.findAllOrCreate(newUsernames);
  const playersMap = Object.fromEntries(newPlayers.map(p => [p.username, p]));

  const formattedTeams = await Promise.all(
    teams.map(async team => {
      const teamName = team.name;
      const participants = team.participants.map(p => playersMap[playerService.standardize(p)]);

      // Add new team
      await competition.$add('participants', participants, { through: { teamName } });

      return { teamName, participants };
    })
  );

  // Update the "updatedAt" timestamp on the competition model
  await competition.changed('updatedAt', true);
  await competition.save();

  return formattedTeams;
}

async function removeTeams(competition: Competition, teamNames: string[]) {
  if (competition.type !== 'team') {
    throw new BadRequestError('Cannot remove teams from a classic competition.');
  }

  if (teamNames.length === 0) {
    throw new BadRequestError('Empty team names list.');
  }

  if (teamNames.some(t => typeof t !== 'string' || t.length === 0)) {
    throw new BadRequestError('All team names must be non-empty strings.');
  }

  const removedPlayersCount = await Participation.destroy({
    where: {
      competitionId: competition.id,
      teamName: teamNames.map(sanitizeTitle)
    }
  });

  if (!removedPlayersCount) {
    throw new BadRequestError('No players were removed from the competition.');
  }

  // Update the "updatedAt" timestamp on the competition model
  await competition.changed('updatedAt', true);
  await competition.save();

  return removedPlayersCount;
}

async function getTeams(competition: Competition) {
  const participants = await competition.$get('participants');

  const teamsMap = {};

  participants.forEach(p => {
    const instance: any = p;
    const { teamName } = instance.participations;

    const player = omit(p.toJSON(), ['participations']);

    if (teamName in teamsMap) {
      teamsMap[teamName].participants.push(player);
    } else {
      teamsMap[teamName] = { name: teamName, participants: [player] };
    }
  });

  return Object.values(teamsMap);
}

/**
 * Get outdated participants for a specific competition id.
 * A participant is considered outdated 60 minutes after their last update
 */
async function getOutdatedParticipants(competitionId: number) {
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
 * within the service (circular dependency).
 * I'd rather call them from the controller.
 */
async function updateAll(competition: Competition, force: boolean, updateFn: (player: Player) => void) {
  const participants = force
    ? await competition.$get('participants')
    : await getOutdatedParticipants(competition.id);

  if (!participants || participants.length === 0) {
    throw new BadRequestError('This competition has no outdated participants.');
  }

  // Execute the update action for every participant
  participants.forEach(player => updateFn(player));

  return participants;
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
  create,
  edit,
  destroy,
  addParticipants,
  removeParticipants,
  addTeams,
  removeTeams,
  addToGroupCompetitions,
  removeFromGroupCompetitions,
  updateAll,
  syncParticipations
};
