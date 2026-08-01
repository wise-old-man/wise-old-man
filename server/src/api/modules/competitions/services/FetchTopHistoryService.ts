import prisma from '../../../../prisma';
import { Metric, Player, Snapshot } from '../../../../types';
import { getMetricValueKey } from '../../../../utils/get-metric-value-key.util';
import { fetchCompetitionDetails } from './FetchCompetitionDetailsService';

export async function fetchCompetitionTopHistory(
  id: number,
  metric: Metric | undefined,
  limit: number
): Promise<
  Array<{
    player: Player;
    history: Array<{
      value: number;
      date: Date;
    }>;
  }>
> {
  const { competition, metrics, participations } = await fetchCompetitionDetails(id, metric);

  const topPlayers = participations.slice(0, limit).map(p => p.player);

  const selectedMetrics = metric !== undefined ? [metric] : metrics.map(m => m.metric);
  const metricValueKeys = selectedMetrics.map(getMetricValueKey);

  const snapshots = (await prisma.snapshot.findMany({
    where: {
      playerId: {
        in: topPlayers.map(t => t.id)
      },
      createdAt: {
        gte: competition.startsAt,
        lte: competition.endsAt
      }
    },
    select: {
      playerId: true,
      createdAt: true,
      ...Object.fromEntries(metricValueKeys.map(key => [key, true]))
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

  return topPlayers.map(player => {
    const snapshots = playerSnapshotMap.get(player.id) || [];

    const history = snapshots
      .map(s => {
        let value = 0;

        for (const valueKey of metricValueKeys) {
          const metricValue = s[valueKey] ?? 0;

          if (metricValue === -1) {
            continue;
          }

          value += metricValue;
        }

        // If unranked in all metrics, show as -1 (unranked)
        if (value === 0) {
          value = -1;
        }

        return {
          value,
          date: s.createdAt
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return { player, history };
  });
}
