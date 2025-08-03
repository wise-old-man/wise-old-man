import prisma from '../../../../prisma';
import { Metric, Player, Snapshot } from '../../../../types';
import { getMetricValueKey } from '../../../../utils/get-metric-value-key.util';
import { fetchCompetitionDetails } from './FetchCompetitionDetailsService';

async function fetchCompetitionTop5Progress(
  id: number,
  metric?: Metric
): Promise<
  Array<{
    player: Player;
    history: Array<{
      value: number;
      date: Date;
    }>;
  }>
> {
  const competitionDetails = await fetchCompetitionDetails(id, metric);
  const metricValueKey = getMetricValueKey(metric || competitionDetails.metric);

  // Select the top 5 players
  const top5Players = competitionDetails.participations.slice(0, 5).map(p => p.player);

  const snapshots = (await prisma.snapshot.findMany({
    where: {
      playerId: {
        in: top5Players.map(t => t.id)
      },
      createdAt: {
        gte: competitionDetails.startsAt,
        lte: competitionDetails.endsAt
      }
    },
    select: {
      [metricValueKey]: true,
      playerId: true,
      createdAt: true
    }
  })) as unknown as Snapshot[];

  const playerSnapshotMap = new Map<number, Snapshot[]>();

  snapshots.forEach(snapshot => {
    const playerSnapshots = playerSnapshotMap.get(snapshot.playerId);
    if (playerSnapshots) {
      playerSnapshots.push(snapshot);
    } else {
      playerSnapshotMap.set(snapshot.playerId, [snapshot]);
    }
  });

  return top5Players.map(player => {
    const snapshots = playerSnapshotMap.get(player.id) || [];

    const history = snapshots
      .map(s => ({ value: s[metricValueKey], date: s.createdAt }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return { player, history };
  });
}

export { fetchCompetitionTop5Progress };
