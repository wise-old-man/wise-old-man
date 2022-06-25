import { uniq } from 'lodash';
import { Metric, getMetricValueKey, isVirtualMetric, CompetitionType } from '../../../utils';
import { Competition, Group, Participation, Player, Snapshot } from '../../../database/models';
import { BadRequestError, NotFoundError } from '../../errors';
import { durationBetween, formatDate } from '../../util/dates';
import * as snapshotServices from '../../modules/snapshots/snapshot.services';
import * as deltaUtils from '../../modules/deltas/delta.utils';

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

export { resolve, getDetails, getCSV };
