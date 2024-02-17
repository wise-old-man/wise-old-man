import { z } from 'zod';
import { Snapshot } from '../../../../prisma';
import { getMetricValueKey, Metric } from '../../../../utils';
import { Top5ProgressResult } from '../competition.types';
import { fetchCompetitionDetails } from './FetchCompetitionDetailsService';
import { findGroupSnapshots } from '../../snapshots/services/FindGroupSnapshotsService';

const inputSchema = z.object({
  id: z.number().int().positive(),
  metric: z.nativeEnum(Metric).optional()
});

type FetchTop5ProgressParams = z.infer<typeof inputSchema>;

async function fetchCompetitionTop5Progress(payload: FetchTop5ProgressParams): Promise<Top5ProgressResult> {
  const params = inputSchema.parse(payload);

  const competitionDetails = await fetchCompetitionDetails(params);
  const metricKey = getMetricValueKey(params.metric || competitionDetails.metric);

  // Select the top 5 players
  const top5Players = competitionDetails.participations.slice(0, 5).map(p => p.player);

  const groupSnapshots = await findGroupSnapshots({
    playerIds: top5Players.map(t => t.id),
    includeAllBetween: true,
    minDate: competitionDetails.startsAt,
    maxDate: competitionDetails.endsAt
  });

  const playerSnapshotMap = new Map<number, Snapshot[]>();

  groupSnapshots.forEach(snapshot => {
    if (playerSnapshotMap.get(snapshot.playerId)) {
      playerSnapshotMap.set(snapshot.playerId, [...playerSnapshotMap.get(snapshot.playerId), snapshot]);
    } else {
      playerSnapshotMap.set(snapshot.playerId, [snapshot]);
    }
  });

  return top5Players.map(player => {
    const snapshots = playerSnapshotMap.get(player.id) || [];

    const history = snapshots
      .map(s => ({ value: s[metricKey], date: s.createdAt }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return { player, history };
  });
}

export { fetchCompetitionTop5Progress };
