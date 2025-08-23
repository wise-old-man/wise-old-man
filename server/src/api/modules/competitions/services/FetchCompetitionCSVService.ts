import dayjs from 'dayjs';
import { CompetitionCSVTableType, CompetitionType, Metric } from '../../../../types';
import { BadRequestError } from '../../../errors';
import { CompetitionDetailsResponse, formatCompetitionDetailsResponse } from '../../../responses';
import { fetchCompetitionDetails } from './FetchCompetitionDetailsService';

type Participant = CompetitionDetailsResponse['participations'][number];

async function fetchCompetitionCSV(
  id: number,
  metric: Metric | undefined,
  table = CompetitionCSVTableType.PARTICIPANTS,
  teamName: string | undefined
): Promise<string> {
  const competitionDetails = await fetchCompetitionDetails(id, metric);

  const competitionDetailsResponse = formatCompetitionDetailsResponse(
    competitionDetails.competition,
    competitionDetails.metrics,
    competitionDetails.group,
    competitionDetails.participations
  );

  if (table === CompetitionCSVTableType.PARTICIPANTS) {
    return getParticipantsCSV(competitionDetailsResponse);
  }

  if (table === CompetitionCSVTableType.TEAM && !teamName) {
    throw new BadRequestError('Team name is a required parameter for the table type of "team".');
  }

  if (competitionDetailsResponse.type === CompetitionType.CLASSIC) {
    throw new BadRequestError('Cannot view team/teams table on a classic competition.');
  }

  if (table === CompetitionCSVTableType.TEAMS) {
    return getTeamsCSV(competitionDetailsResponse);
  }

  return getParticipantsCSV(competitionDetailsResponse, teamName!);
}

function getParticipantsCSV(competitionDetails: CompetitionDetailsResponse, teamName?: string): string {
  const columns: Array<{
    header: string;
    resolveCell: (row: Participant, index: number) => string;
  }> = [
    { header: 'Rank', resolveCell: (_, index) => String(index + 1) },
    { header: 'Username', resolveCell: row => row.player.displayName },
    { header: 'Start', resolveCell: row => String(row.progress.start) },
    { header: 'End', resolveCell: row => String(row.progress.end) },
    { header: 'Gained', resolveCell: row => String(row.progress.gained) },
    {
      header: 'Last Updated',
      resolveCell: row => (row.updatedAt ? dayjs(row.updatedAt).format('MM/DD/YYYY HH:mm:ss') : '')
    }
  ];

  if (competitionDetails.type === CompetitionType.TEAM && teamName === undefined) {
    columns.splice(2, 0, { header: 'Team', resolveCell: row => row.teamName! });
  }

  const headers = columns.map(c => c.header).join(',');

  const rows = competitionDetails.participations
    .filter(p => teamName === undefined || p.teamName === teamName)
    .map((p, i) => columns.map(c => c.resolveCell(p, i)).join(','));

  return [headers, ...rows].join('\n');
}

function getTeamsCSV(competitionDetails: CompetitionDetailsResponse): string {
  const teamNames = [...new Set(competitionDetails.participations.map(p => p.teamName!))];

  // Mapping these to ensure every team is unique by name
  const teamMap = new Map<string, Participant[]>(teamNames.map(name => [name, []]));

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

  const columns: Array<{
    header: string;
    resolveCell: (row: (typeof teamsList)[number], index: number) => string;
  }> = [
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

export { fetchCompetitionCSV };
