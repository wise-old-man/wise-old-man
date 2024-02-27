import { CompetitionCSVTableType, CompetitionType, Metric } from '../../../../utils';
import { formatDate } from '../../../util/dates';
import { BadRequestError } from '../../../errors';
import { CompetitionDetails, ParticipationWithPlayerAndProgress } from '../competition.types';
import { fetchCompetitionDetails } from './FetchCompetitionDetailsService';

async function fetchCompetitionCSV(
  id: number,
  metric: Metric | undefined,
  table = CompetitionCSVTableType.PARTICIPANTS,
  teamName: string | undefined
): Promise<string> {
  const competitionDetails = await fetchCompetitionDetails(id, metric);

  if (table === CompetitionCSVTableType.PARTICIPANTS) {
    return getParticipantsCSV(competitionDetails);
  }

  if (table === CompetitionCSVTableType.TEAM && !teamName) {
    throw new BadRequestError('Team name is a required parameter for the table type of "team".');
  }

  if (competitionDetails.type === CompetitionType.CLASSIC) {
    throw new BadRequestError('Cannot view team/teams table on a classic competition.');
  }

  if (table === CompetitionCSVTableType.TEAMS) {
    return getTeamsCSV(competitionDetails);
  }

  return getTeamCSV(competitionDetails, teamName!);
}

type TeamRow = {
  name: string;
  totalGained: number;
  avgGained: number;
  participants: (ParticipationWithPlayerAndProgress & { teamRank: number })[];
};

type ParticipantsCSVColumn = {
  header: string;
  resolveCell: (row: ParticipationWithPlayerAndProgress, index: number) => string;
};

type TeamsCSVColumn = {
  header: string;
  resolveCell: (row: TeamRow, index: number) => string;
};

function getParticipantsCSV(competitionDetails: CompetitionDetails): string {
  const columns: ParticipantsCSVColumn[] = [
    { header: 'Rank', resolveCell: (_, index) => String(index + 1) },
    { header: 'Username', resolveCell: row => row.player.displayName },
    { header: 'Start', resolveCell: row => String(row.progress.start) },
    { header: 'End', resolveCell: row => String(row.progress.end) },
    { header: 'Gained', resolveCell: row => String(row.progress.gained) },
    {
      header: 'Last Updated',
      resolveCell: row => (row.updatedAt ? formatDate(row.updatedAt, 'MM/DD/YYYY HH:mm:ss') : '')
    }
  ];

  if (competitionDetails.type === CompetitionType.TEAM) {
    columns.splice(2, 0, { header: 'Team', resolveCell: row => row.teamName! });
  }

  const headers = columns.map(c => c.header).join(',');

  const rows = competitionDetails.participations.map((p, i) =>
    columns.map(c => c.resolveCell(p, i)).join(',')
  );

  return [headers, ...rows].join('\n');
}

function getTeamsCSV(competitionDetails: CompetitionDetails): string {
  const teamNames = [...new Set(competitionDetails.participations.map(p => p.teamName!))];

  // Mapping these to ensure every team is unique by name
  const teamMap = new Map<string, ParticipationWithPlayerAndProgress[]>(teamNames.map(name => [name, []]));

  competitionDetails.participations.forEach(p => {
    teamMap.get(p.teamName!)?.push(p);
  });

  const teamsList = Array.from(teamMap.entries())
    .map(([name, participants]) => {
      // Sort participants by most gained, and add team rank
      const sortedParticipants = participants
        .sort((a, b) => b.progress.gained - a.progress.gained)
        .map((p, i) => ({ ...p, teamRank: i + 1 }));

      const totalGained = participants.map(p => p.progress.gained).reduce((a, c) => a + c);
      const avgGained = totalGained / participants.length;

      return { name, participants: sortedParticipants, totalGained, avgGained };
    })
    .sort((a, b) => b.totalGained - a.totalGained); // Sort teams by most total gained

  const columns: TeamsCSVColumn[] = [
    { header: 'Rank', resolveCell: (_, index) => String(index + 1) },
    { header: 'Name', resolveCell: row => row.name },
    { header: 'Players', resolveCell: row => String(row.participants.length) },
    { header: 'Total Gained', resolveCell: row => String(row.totalGained) },
    { header: 'Average Gained', resolveCell: row => String(row.avgGained) },
    { header: 'MVP', resolveCell: row => row.participants[0].player.displayName }
  ];

  const headers = columns.map(c => c.header).join(',');
  const rows = teamsList.map((p, i) => columns.map(c => c.resolveCell(p, i)).join(','));

  return [headers, ...rows].join('\n');
}

function getTeamCSV(competitionDetails: CompetitionDetails, teamName: string): string {
  const columns: ParticipantsCSVColumn[] = [
    { header: 'Rank', resolveCell: (_, index) => String(index + 1) },
    { header: 'Username', resolveCell: row => row.player.displayName },
    { header: 'Start', resolveCell: row => String(row.progress.start) },
    { header: 'End', resolveCell: row => String(row.progress.end) },
    { header: 'Gained', resolveCell: row => String(row.progress.gained) },
    { header: 'Last Updated', resolveCell: row => formatDate(row.updatedAt) }
  ];

  const headers = columns.map(c => c.header).join(',');

  const rows = competitionDetails.participations
    .filter(p => p.teamName === teamName)
    .map((p, i) => columns.map(c => c.resolveCell(p, i)).join(','));

  return [headers, ...rows].join('\n');
}

export { fetchCompetitionCSV };
