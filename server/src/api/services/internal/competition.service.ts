import { filter, includes, omit, uniq, uniqBy } from 'lodash';
import moment from 'moment';
import { Op, Sequelize } from 'sequelize';
import {
  Metric,
  METRICS,
  CompetitionType,
  COMPETITION_TYPES,
  COMPETITION_STATUSES,
  CompetitionStatus,
  getMetricValueKey,
  isVirtualMetric
} from '@wise-old-man/utils';
import { Competition, Group, Participation, Player, Snapshot } from '../../../database/models';
import { Pagination } from '../../../types';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../errors';
import { durationBetween, formatDate, isPast } from '../../util/dates';
import { buildQuery } from '../../util/query';
import * as cryptService from '../external/crypt.service';
import * as deltaService from './delta.service';
import * as groupService from './group.service';
import * as playerService from './player.service';
import * as snapshotService from './snapshot.service';

// Temporary
const MAINTENANCE_START = new Date('2022-02-13T00:00:00.000Z');
const MAINTENANCE_END = new Date('2022-02-13T04:00:00.000Z');

interface Team {
  name: string;
  participants: string[];
}

interface CompetitionParticipant extends Player {
  teamName?: string;
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

export interface CompetitionDetails extends Competition {
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
  if (status && !COMPETITION_STATUSES.includes(status.toLowerCase() as CompetitionStatus)) {
    throw new BadRequestError(`Invalid status.`);
  }

  // The metric is optional, however if present, should be valid
  if (metric && !METRICS.includes(metric.toLowerCase() as Metric)) {
    throw new BadRequestError(`Invalid metric.`);
  }

  // The type is optional, however if present, should be valid
  if (type && !COMPETITION_TYPES.includes(type.toLowerCase() as CompetitionType)) {
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

    if (formattedStatus === CompetitionStatus.FINISHED) {
      query.endsAt = { [Op.lt]: now };
    } else if (formattedStatus === CompetitionStatus.UPCOMING) {
      query.startsAt = { [Op.gt]: now };
    } else if (formattedStatus === CompetitionStatus.ONGOING) {
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

function getCSV(details: CompetitionDetails, table: string, teamName?: string): string {
  if (table === 'participants') {
    return getParticipantsCSV(details);
  } else if (table === 'teams') {
    return getTeamsCSV(details);
  } else if (table === 'team') {
    return getTeamCSV(details, teamName);
  }

  throw new BadRequestError("Invalid 'table' parameter. Accepted values: [participants, teams, team]");
}

function getTeamCSV(details: CompetitionDetails, teamName: string): string {
  const columns = [
    { header: 'Rank', value: (_, index) => index + 1 },
    { header: 'Username', value: row => row.displayName },
    { header: 'Start', value: row => row.progress.start },
    { header: 'End', value: row => row.progress.end },
    { header: 'Gained', value: row => row.progress.gained },
    { header: 'Last Updated', value: row => formatDate(row.updatedAt) }
  ];

  const headers = columns.map(c => c.header).join(',');

  const rows = details.participants
    .filter(p => p.teamName === teamName)
    .map((p, i) => columns.map(c => c.value(p, i)).join(','));

  return [headers, ...rows].join('\n');
}

function getTeamsCSV(details: CompetitionDetails): string {
  const teamNames = uniq(details.participants.map(p => p.teamName));
  const teamMap = Object.fromEntries(teamNames.map(t => [t, { name: t, participants: [] }]));

  details.participants.forEach(p => {
    teamMap[p.teamName].participants.push(p);
  });

  const teamsList = Object.values(teamMap).map(t => {
    // Sort participants by most gained, and add team rank
    const sortedParticipants = t.participants
      .sort((a, b) => b.progress.gained - a.progress.gained)
      .map((p, i) => ({ ...p, teamRank: i + 1 }));

    const totalGained = t.participants.map(p => p.progress.gained).reduce((a, c) => a + c);
    const avgGained = totalGained / t.participants.length;

    return { ...t, participants: sortedParticipants, totalGained, avgGained };
  });

  // Sort teams by most total gained
  const data = teamsList.sort((a, b) => b.totalGained - a.totalGained).map((t, i) => ({ ...t, rank: i + 1 }));

  const columns = [
    { header: 'Rank', value: (_, index) => index + 1 },
    { header: 'Name', value: row => row.name },
    { header: 'Players', value: row => row.participants.length },
    { header: 'Total Gained', value: row => row.totalGained },
    { header: 'Average Gained', value: row => row.avgGained },
    { header: 'MVP', value: row => row.participants[0].displayName }
  ];

  const headers = columns.map(c => c.header).join(',');
  const rows = data.map((p, i) => columns.map(c => c.value(p, i)).join(','));

  return [headers, ...rows].join('\n');
}

function getParticipantsCSV(details: CompetitionDetails): string {
  const columns = [
    { header: 'Rank', value: (_, index) => index + 1 },
    { header: 'Username', value: row => row.displayName },
    { header: 'Start', value: row => row.progress.start },
    { header: 'End', value: row => row.progress.end },
    { header: 'Gained', value: row => row.progress.gained },
    { header: 'Last Updated', value: row => formatDate(row.updatedAt) }
  ];

  if (details.type === CompetitionType.TEAM) {
    columns.splice(2, 0, { header: 'Team', value: row => row.teamName });
  }

  const headers = columns.map(c => c.header).join(',');
  const rows = details.participants.map((p, i) => columns.map(c => c.value(p, i)).join(','));

  return [headers, ...rows].join('\n');
}

/**
 * Get all the data on a given competition.
 */
async function getDetails(competition: Competition, metric?: string): Promise<CompetitionDetails | any> {
  const competitionMetric = (metric || competition.metric) as Metric;
  const isVirtual = isVirtualMetric(competitionMetric);

  const metricKey = getMetricValueKey(competitionMetric);
  const duration = durationBetween(competition.startsAt, competition.endsAt);

  const participations = await Participation.findAll({
    attributes: ['playerId', 'teamName'],
    where: { competitionId: competition.id },
    include: [
      { model: Player },
      { model: Snapshot, as: 'startSnapshot', attributes: isVirtual ? null : [metricKey] },
      { model: Snapshot, as: 'endSnapshot', attributes: isVirtual ? null : [metricKey] }
    ]
  });

  const participants = participations
    .map(({ player, teamName, startSnapshot, endSnapshot }) => {
      return {
        ...player.toJSON(),
        teamName,
        progress: deltaService.calculateMetricDiff(player, startSnapshot, endSnapshot, competitionMetric),
        history: []
      };
    })
    .sort((a, b) => b.progress.gained - a.progress.gained || b.progress.start - a.progress.start);

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
  const invalidTeams = teamNames.filter(t => t.length > 30);

  if (invalidTeams.length > 0) {
    throw new BadRequestError(
      `Team names can only be 30 characters max. The following are invalid: [${invalidTeams.join(', ')}]`
    );
  }

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
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
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

  if (!metric || !METRICS.includes(metric as Metric)) {
    throw new BadRequestError('Invalid competition metric.');
  }

  if (startsAt.getTime() - endsAt.getTime() > 0) {
    throw new BadRequestError('Start date must be before the end date.');
  }

  if (isPast(startsAt) || isPast(endsAt)) {
    throw new BadRequestError('Invalid dates: All start and end dates must be in the future.');
  }

  if (startsAt >= MAINTENANCE_START && startsAt <= MAINTENANCE_END) {
    throw new BadRequestError(
      'Please choose another start date: Wise Old Man will be under maintenance from 00:00 to 04:00 (GMT)'
    );
  }

  if (endsAt >= MAINTENANCE_START && endsAt <= MAINTENANCE_END) {
    throw new BadRequestError(
      'Please choose another end date: Wise Old Man will be under maintenance from 00:00 to 04:00 (GMT)'
    );
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
    throw new BadRequestError('Cannot include both "participants" and "teams", they are mutually exclusive.');
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
    type: isTeamCompetition ? CompetitionType.TEAM : CompetitionType.CLASSIC,
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

  if (metric && !METRICS.includes(metric as Metric)) {
    throw new BadRequestError(`Invalid competition metric.`);
  }

  if (startsAt >= MAINTENANCE_START && startsAt <= MAINTENANCE_END) {
    throw new BadRequestError(
      'Please choose another start date: Wise Old Man will be under maintenance from 00:00 to 04:00 (GMT)'
    );
  }

  if (endsAt >= MAINTENANCE_START && endsAt <= MAINTENANCE_END) {
    throw new BadRequestError(
      'Please choose another end date: Wise Old Man will be under maintenance from 00:00 to 04:00 (GMT)'
    );
  }

  const hasNewTeams = teams && teams.length > 0;
  const hasNewParticipants = participants && participants.length > 0;

  if (competition.type === CompetitionType.CLASSIC && hasNewTeams) {
    throw new BadRequestError("The competition type cannot be changed to 'team'.");
  }

  if (competition.type === CompetitionType.TEAM && hasNewParticipants) {
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

/**
 * Resets a competition's verification code by generating a new one
 * and updating the verificationHash field in the database.
 */
async function resetVerificationCode(competition: Competition): Promise<string> {
  const [code, hash] = await cryptService.generateVerification();
  await competition.update({ verificationHash: hash });

  return code;
}

async function setTeams(competition: Competition, teams: Team[]) {
  if (!competition) throw new BadRequestError('Invalid competition.');

  const existingParticipations = await Participation.findAll({
    where: { competitionId: competition.id }
  });

  const allUsernames = teams.map(t => t.participants.map(playerService.standardize)).flat();
  const allPlayers = await playerService.findAllOrCreate(allUsernames);

  const playersMap = Object.fromEntries(allPlayers.map(p => [p.username, p]));

  // Delete all existing participations (and teams)
  await Participation.destroy({ where: { competitionId: competition.id } });

  // Recalculate team and participant placements
  const editedTeams = teams.map(team => {
    return team.participants.map(p => {
      const player = playersMap[playerService.standardize(p)];
      const participation = player && existingParticipations.find(e => e.playerId === player.id);

      return {
        competitionId: competition.id,
        playerId: player.id,
        teamName: team.name,
        startSnapshotId: participation?.startSnapshotId || null,
        endSnapshotId: participation?.endSnapshotId || null
      };
    });
  });

  // Re-create the newly edited participations
  await Participation.bulkCreate(editedTeams.flat());

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
  if (competition.type === CompetitionType.TEAM) {
    throw new BadRequestError('Cannot add participants to a team competition.');
  }

  if (usernames.length === 0) {
    throw new BadRequestError('Empty participants list.');
  }

  const invalidUsernames = usernames.filter(u => !playerService.isValidUsername(u));

  if (invalidUsernames && invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
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
  if (competition.type === CompetitionType.TEAM) {
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

  if (competition.type === CompetitionType.CLASSIC) {
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

  if (duplicateTeamNames && duplicateTeamNames.length > 0) {
    throw new BadRequestError(`Found repeated team names: [${duplicateTeamNames.join(', ')}]`);
  }

  const duplicateUsernames = newUsernames.filter(t => currentUsernames.map((c: string) => c).includes(t));

  if (duplicateUsernames && duplicateUsernames.length > 0) {
    throw new BadRequestError(`Found repeated usernames: [${duplicateUsernames.join(', ')}]`);
  }

  const invalidUsernames = newUsernames.filter(t => !playerService.isValidUsername(t));

  if (invalidUsernames && invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
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
  if (competition.type !== CompetitionType.TEAM) {
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
 * A participant is considered outdated 24 hours (or 1h) after their last update
 */
async function getOutdatedParticipants(competitionId: number, cooldownDuration: number) {
  if (!competitionId) throw new BadRequestError('Invalid competition id.');

  const cooldownExpiration = moment().subtract(cooldownDuration, 'hours');

  const participantsToUpdate = await Participation.findAll({
    attributes: ['competitionId', 'playerId'],
    where: { competitionId },
    include: [
      {
        model: Player,
        where: { updatedAt: { [Op.lt]: cooldownExpiration.toDate() } }
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
      type: CompetitionType.CLASSIC,
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
  if (competition.endsAt.getTime() < Date.now()) {
    throw new BadRequestError('This competition has ended. Cannot update all.');
  }

  const hoursTillEnd = Math.max(0, (competition.endsAt.getTime() - Date.now()) / 1000 / 60 / 60);
  const hoursFromStart = Math.max(0, (Date.now() - competition.startsAt.getTime()) / 1000 / 60 / 60);

  const hasReducedCooldown = hoursTillEnd < 6 || (hoursFromStart < 6 && hoursFromStart > 0);
  const cooldownDuration = hasReducedCooldown ? 1 : 24;

  const participants = force
    ? await competition.$get('participants')
    : await getOutdatedParticipants(competition.id, cooldownDuration);

  if (!participants || participants.length === 0) {
    throw new BadRequestError('This competition has no outdated participants (updated over 1h ago).');
  }

  // Execute the update action for every participant
  participants.forEach(player => updateFn(player));

  return { participants, cooldownDuration };
}

/**
 * Sync all participations for a given player id.
 *
 * When a player is updated, this should be executed by a job.
 * This should update all the "endSnapshotId" field in the player's participations.
 */
async function syncParticipations(playerId: number, latestSnapshot: Snapshot) {
  const currentDate = new Date();

  // Get all on-going participations
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

  if (!participations || participations.length === 0) return;

  await Promise.all(
    participations.map(async participation => {
      const { competition } = participation;

      // Update this participation's latest (end) snapshot
      participation.endSnapshotId = latestSnapshot.id;

      // If this participation's starting snapshot has not been set,
      // find the first snapshot created since the start date and set it
      if (!participation.startSnapshot) {
        const startSnapshot = await snapshotService.findFirstSince(playerId, competition.startsAt);
        participation.startSnapshotId = startSnapshot.id;
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
  getCSV,
  create,
  edit,
  destroy,
  resetVerificationCode,
  addParticipants,
  removeParticipants,
  addTeams,
  removeTeams,
  addToGroupCompetitions,
  removeFromGroupCompetitions,
  updateAll,
  syncParticipations
};
