import { AsyncResult, complete, errored } from '@attio/fetchable';
import dayjs from 'dayjs';
import { CompetitionCSVTableType, CompetitionType, Metric } from '../../../../types';
import { CompetitionDetailsResponse, formatCompetitionDetailsResponse } from '../../../responses';
import { fetchCompetitionDetails } from './FetchCompetitionDetailsService';

type Participant = CompetitionDetailsResponse['participations'][number];

async function fetchCompetitionCSV(
  id: number,
  metric: Metric | undefined,
  table = CompetitionCSVTableType.PARTICIPANTS,
  teamName: string | undefined
): AsyncResult<
  string,
  { code: 'TEAM_NAME_IS_REQUIRED' } | { code: 'CANNOT_VIEW_TEAM_TABLES_FOR_CLASSIC_COMPETITION' }
> {
  const details = await fetchCompetitionDetails(id, metric);
  const competitionDetailsResponse = formatCompetitionDetailsResponse(details);

  if (table === CompetitionCSVTableType.PARTICIPANTS) {
    return complete(getParticipantsCSV(competitionDetailsResponse));
  }

  if (table === CompetitionCSVTableType.TEAM && teamName === undefined) {
    return errored({ code: 'TEAM_NAME_IS_REQUIRED' });
  }

  if (competitionDetailsResponse.type === CompetitionType.CLASSIC) {
    return errored({ code: 'CANNOT_VIEW_TEAM_TABLES_FOR_CLASSIC_COMPETITION' });
  }

  if (table === CompetitionCSVTableType.TEAMS) {
    return complete(getTeamsCSV(competitionDetailsResponse));
  }

  return complete(getParticipantsCSV(competitionDetailsResponse, teamName!));
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
