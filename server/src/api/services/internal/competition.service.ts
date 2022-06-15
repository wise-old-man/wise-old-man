import { filter, includes, omit, uniq, uniqBy } from 'lodash';
import { Metric, METRICS, getMetricValueKey, isVirtualMetric, CompetitionType } from '../../../utils';
import { Competition, Group, Participation, Player, Snapshot } from '../../../database/models';
import { BadRequestError, NotFoundError } from '../../errors';
import { durationBetween, formatDate, isPast } from '../../util/dates';
import { buildQuery } from '../../util/query';
import * as snapshotServices from '../../modules/snapshots/snapshot.services';
import * as playerServices from '../../modules/players/player.services';
import * as deltaUtils from '../../modules/deltas/delta.utils';
import * as playerUtils from '../../modules/players/player.utils';
import * as competitionUtils from '../../modules/competitions/competition.utils';

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

interface ResolveOptions {
  includeGroup?: boolean;
  includeHash?: boolean;
}

interface EditCompetitionDTO {
  title?: string;
  metric?: string;
  startsAt?: Date;
  endsAt?: Date;
  participants?: string[];
  teams?: Team[];
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
      const diff = deltaUtils.calculateMetricDelta(
        player as any,
        competitionMetric,
        startSnapshot,
        endSnapshot
      );

      return {
        ...player.toJSON(),
        teamName,
        progress: diff,
        history: []
      };
    })
    .sort((a, b) => b.progress.gained - a.progress.gained || b.progress.start - a.progress.start);

  // Select the top 5 players
  const top5Ids = participants.slice(0, 5).map((p: any) => p.id);

  // Select all snapshots for the top 5 players, created during the competition,
  // then convert them into a simpler format
  const raceData = (
    await snapshotServices.findGroupSnapshots({
      playerIds: top5Ids,
      includeAllBetween: true,
      minDate: competition.startsAt,
      maxDate: competition.endsAt
    })
  ).map(s => ({
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

function validateTeamsList(teams: Team[]) {
  if (!teams || teams.length === 0) {
    throw new BadRequestError('Invalid or empty teams list.');
  }

  if (teams.some(t => !t.name || typeof t.name !== 'string' || t.name.length === 0)) {
    throw new BadRequestError('All teams must have a name property.');
  }

  // Sanitize each team's name
  teams.forEach(t => {
    t.name = competitionUtils.sanitizeTitle(t.name);
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
    t.participants = t.participants.map(playerUtils.standardize);
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

  const invalidUsernames = participants.filter(username => !playerUtils.isValidUsername(username));

  if (invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
  }

  const allUsernames = participants.map(playerUtils.standardize);
  const duplicateUsernames = filter(allUsernames, (val, i, it) => includes(it, val, i + 1));

  if (duplicateUsernames && duplicateUsernames.length > 0) {
    throw new BadRequestError(`Found repeated usernames: [${duplicateUsernames.join(', ')}]`);
  }
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
    title: title && competitionUtils.sanitizeTitle(title),
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

async function setTeams(competition: Competition, teams: Team[]) {
  if (!competition) throw new BadRequestError('Invalid competition.');

  const existingParticipations = await Participation.findAll({
    where: { competitionId: competition.id }
  });

  const allPlayers = await playerServices.findPlayers({
    usernames: teams.map(t => t.participants.map(playerUtils.standardize)).flat(),
    createIfNotFound: true
  });

  const playersMap = Object.fromEntries(allPlayers.map(p => [p.username, p]));

  // Delete all existing participations (and teams)
  await Participation.destroy({ where: { competitionId: competition.id } });

  // Recalculate team and participant placements
  const editedTeams = teams.map(team => {
    return team.participants.map(p => {
      const player = playersMap[playerUtils.standardize(p)];
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

  const uniqueUsernames = uniqBy(usernames, u => playerUtils.standardize(u));

  const existingParticipants = await competition.$get('participants');
  const existingUsernames = existingParticipants.map(e => e.username);

  const usernamesToAdd = uniqueUsernames.filter(u => !existingUsernames.includes(playerUtils.standardize(u)));

  const playersToRemove = existingParticipants.filter(
    p => !uniqueUsernames.map(playerUtils.standardize).includes(p.username)
  );

  const playersToAdd = await playerServices.findPlayers({
    usernames: usernamesToAdd,
    createIfNotFound: true
  });

  if (playersToRemove && playersToRemove.length > 0) {
    await competition.$remove('participants', playersToRemove);
  }

  if (playersToAdd && playersToAdd.length > 0) {
    await Participation.bulkCreate(
      playersToAdd.map(p => ({ playerId: p.id, competitionId: competition.id }))
    );
  }

  const participants = await competition.$get('participants');
  return participants.map(p => omit(p.toJSON(), ['participations']));
}

export { resolve, getDetails, getCSV, edit };
