import prisma from '../../../../prisma';
import { Metric, MetricMeasure, Player } from '../../../../types';
import { getMetricRankKey } from '../../../../utils/get-metric-rank-key.util';
import { getMetricValueKey } from '../../../../utils/get-metric-value-key.util';
import { getLevel, MetricProps } from '../../../../utils/shared';
import { NotFoundError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';
import { getTotalLevel } from '../../snapshots/snapshot.utils';

type EntryType =
  | {
      type: 'skill';
      rank: number;
      level: number;
      experience: number;
    }
  | {
      type: 'boss';
      rank: number;
      kills: number;
    }
  | {
      type: 'activity';
      rank: number;
      score: number;
    }
  | {
      type: 'computed';
      rank: number;
      value: number;
    };

async function fetchGroupHiscores(
  groupId: number,
  metric: Metric,
  pagination: PaginationOptions
): Promise<Array<{ player: Player; data: EntryType }>> {
  const memberships = await prisma.membership.findMany({
    where: { groupId },
    include: {
      player: {
        include: {
          latestSnapshot: true
        }
      }
    }
  });

  if (!memberships || memberships.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }

    return [];
  }

  const measure = MetricProps[metric].measure;
  const rankKey = getMetricRankKey(metric);
  const valueKey = getMetricValueKey(metric);

  return memberships
    .filter(m => !!m.player.latestSnapshot)
    .map(({ player }) => {
      const snapshot = player.latestSnapshot!;

      const rank = snapshot[rankKey];
      const value = snapshot[valueKey];

      switch (measure) {
        case MetricMeasure.EXPERIENCE: {
          const lvl = metric === Metric.OVERALL ? getTotalLevel(snapshot) : getLevel(value);
          return {
            player,
            data: { rank, experience: value, level: lvl, type: 'skill' } as const
          };
        }
        case MetricMeasure.KILLS: {
          return {
            player,
            data: { rank, kills: value, type: 'boss' } as const
          };
        }
        case MetricMeasure.SCORE: {
          return {
            player,
            data: { rank, score: value, type: 'activity' } as const
          };
        }
        case MetricMeasure.VALUE:
          return {
            player,
            data: { rank, value: value, type: 'computed' } as const
          };
      }
    })
    .sort((a, b) => {
      if (metric === Metric.OVERALL) {
        return b.data.level! - a.data.level! || b.data.experience! - a.data.experience!;
      }

      return b.data[measure]! - a.data[measure]!;
    })
    .slice(pagination.offset, pagination.offset + pagination.limit);
}

export { fetchGroupHiscores };
