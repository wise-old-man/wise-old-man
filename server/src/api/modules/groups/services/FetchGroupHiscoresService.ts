import prisma from '../../../../prisma';
import {
  getMetricMeasure,
  getMetricRankKey,
  getMetricValueKey,
  Metric,
  MetricMeasure,
  getLevel
} from '../../../../utils';
import { omit } from '../../../util/objects';
import { PaginationOptions } from '../../../util/validation';
import { NotFoundError } from '../../../errors';
import { GroupHiscoresEntry, GroupHiscoresSkillItem } from '../group.types';
import { getTotalLevel } from '../../snapshots/snapshot.utils';

async function fetchGroupHiscores(
  groupId: number,
  metric: Metric,
  pagination: PaginationOptions
): Promise<GroupHiscoresEntry[]> {
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

  const measure = getMetricMeasure(metric);
  const rankKey = getMetricRankKey(metric);
  const valueKey = getMetricValueKey(metric);

  return memberships
    .filter(m => !!m.player.latestSnapshot)
    .map(({ player }) => {
      const snapshot = player.latestSnapshot!;

      let data: GroupHiscoresEntry['data'];

      const rank = snapshot[rankKey];
      const value = snapshot[valueKey];

      if (measure === MetricMeasure.EXPERIENCE) {
        const lvl = metric === Metric.OVERALL ? getTotalLevel(snapshot) : getLevel(value);
        data = { rank, experience: value, level: lvl, type: 'skill' };
      } else if (measure === MetricMeasure.KILLS) {
        data = { rank, kills: value, type: 'boss' };
      } else if (measure === MetricMeasure.SCORE) {
        data = { rank, score: value, type: 'activity' };
      } else {
        data = { rank, value: value, type: 'computed' };
      }

      return {
        player: omit(player, 'latestSnapshot'),
        data
      };
    })
    .sort((a, b) => {
      if (metric === Metric.OVERALL) {
        const aData = a.data as GroupHiscoresSkillItem;
        const bData = b.data as GroupHiscoresSkillItem;

        return bData.level - aData.level || bData.experience - aData.experience;
      }

      return b.data[measure] - a.data[measure];
    })
    .slice(pagination.offset, pagination.offset + pagination.limit);
}

export { fetchGroupHiscores };
